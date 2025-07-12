import React from "react";
import { Play, Tag } from "lucide-react";

const EmptyState = React.memo(({ type, searchQuery }) => (
    <div className="text-center py-12">
        <div className={`${type === 'edukasi' ? 'bg-blue-100' : 'bg-green-100'} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4`}>
            {type === 'edukasi' ? (
                <Play className="h-12 w-12 text-blue-600" />
            ) : (
                <Tag className="h-12 w-12 text-green-600" />
            )}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchQuery ? 'Tidak Ada Hasil' : `Belum Ada Konten ${type === 'edukasi' ? 'Edukasi' : 'Promosi'}`}
        </h3>
        <p className="text-gray-600">
            {searchQuery
                ? `Tidak ditemukan konten yang sesuai dengan pencarian "${searchQuery}"`
                : `Konten ${type === 'edukasi' ? 'edukasi' : 'promosi'} akan segera hadir`
            }
        </p>
    </div>
));

export default EmptyState;
