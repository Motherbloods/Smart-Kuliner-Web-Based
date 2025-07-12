import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorDisplay = React.memo(({ error, retryLoad }) => (
    <div className="text-center py-12">
        <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Terjadi Kesalahan
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
            onClick={retryLoad}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
            <RefreshCw className="h-5 w-5" />
            <span>Coba Lagi</span>
        </button>
    </div>
));

export default ErrorDisplay;
