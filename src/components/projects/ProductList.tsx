'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProjects';
import { Product } from '@/types/project';
import { cn, formatDate } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  MoreVertical,
  Layers
} from 'lucide-react';
import { SubProjectList } from './SubProjectList';

interface Props {
  projectId: number;
}

export function ProductList({ projectId }: Props) {
  const { data: products, isLoading } = useProducts(projectId);
  const [expandedProducts, setExpandedProducts] = useState<number[]>([]);

  const toggleProduct = (id: number) => {
    setExpandedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  if (isLoading) return <div className="p-4 space-y-4">
     {[1, 2].map(i => <div key={i} className="h-20 animate-pulse bg-gray-100 rounded-lg" />)}
  </div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            Products & Versions
         </h3>
         <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
            <Plus className="h-3 w-3" /> Add Product
         </button>
      </div>

      <div className="space-y-3">
        {products?.map((product: Product) => (
          <div key={product.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleProduct(product.id)}
            >
              <div className="flex items-center gap-4">
                <div className="text-gray-400">
                   {expandedProducts.includes(product.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">{product.versionName}</h4>
                   <div className="flex items-center gap-3 mt-1">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                        product.releaseType === 'Major' ? "bg-blue-100 text-blue-700" :
                        product.releaseType === 'Minor' ? "bg-teal-100 text-teal-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {product.releaseType}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                         <Calendar className="h-3 w-3" />
                         Target: {formatDate(product.plannedReleaseDate)}
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <span className={cn(
                   "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                   product.status === 'Released' ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"
                 )}>
                    {product.status}
                 </span>
                 <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                 </button>
              </div>
            </div>

            {expandedProducts.includes(product.id) && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                 <SubProjectList projectId={projectId} productId={product.id} />
              </div>
            )}
          </div>
        ))}

        {products?.length === 0 && (
           <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-100">
              <p className="text-sm text-gray-400 italic">No products defined for this project</p>
           </div>
        )}
      </div>
    </div>
  );
}
