import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Gem, RefreshCw, AlertCircle, Hourglass, Info, Crown, DollarSign } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

const MyJewels = ({ contract, account }) => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMyJewels = useCallback(async () => {
        if (!contract || !account) {
            console.log('⚠️ Contrato o cuenta no disponible');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('💎 Cargando joyas del propietario:', account);

            const jewels = [];

            // Obtener IDs de productos que te pertenecen
            const productIds = await contract.getProductsByOwner(account);
            console.log('📋 IDs encontrados:', productIds.map(id => Number(id)));

            // Cargar detalles de cada producto
            for (let i = 0; i < productIds.length; i++) {
                const productId = Number(productIds[i]);
                
                try {
                    const product = await contract.products(productId);
                    
                    // Solo mostrar productos vendidos (no disponibles) que ahora te pertenecen
                    if (!product.isAvailable) {
                        jewels.push({
                            id: productId,
                            name: product.name || 'Sin nombre',
                            description: product.description || 'Sin descripción',
                            price: product.price,
                            owner: product.owner,
                            creator: product.creator || product.owner,
                            isAvailable: product.isAvailable
                        });
                        console.log(`✅ Joya ${productId} añadida:`, product.name);
                    }
                } catch (productError) {
                    console.error(`❌ Error cargando producto ${productId}:`, productError);
                }
            }

            console.log(`✅ Total joyas en colección: ${jewels.length}`);
            setMyProducts(jewels);
            setError('');

        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [contract, account]);

    useEffect(() => {
        console.log('🔄 MyJewels montado');
        fetchMyJewels();
    }, [fetchMyJewels]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Hourglass size={48} className="text-purple-500 animate-spin mb-4" />
                <p className="text-xl text-purple-600">Cargando tu colección...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error al cargar</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                    onClick={fetchMyJewels}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (myProducts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Gem size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-xl font-semibold mb-2">
                    Tu colección está vacía
                </p>
                <p className="text-gray-400 mb-4">
                    Compra joyas desde el Catálogo para ver aquí tus adquisiciones
                </p>
                <button
                    onClick={fetchMyJewels}
                    className="text-purple-500 hover:text-purple-600 flex items-center text-sm"
                >
                    <RefreshCw size={14} className="mr-2" />
                    Actualizar
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-purple-600 flex items-center">
                        <Crown size={28} className="mr-2" />
                        Mi Colección de Joyas
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {myProducts.length} {myProducts.length === 1 ? 'joya' : 'joyas'} en tu colección
                    </p>
                </div>
                <button
                    onClick={fetchMyJewels}
                    className="text-gray-600 hover:text-purple-600 flex items-center text-sm transition"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Actualizar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map((jewel) => (
                    <div 
                        key={jewel.id}
                        className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Gem size={24} className="mr-2" />
                                    <span className="font-bold text-lg truncate max-w-[200px]" title={jewel.name}>
                                        {jewel.name}
                                    </span>
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                    ID #{jewel.id}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 text-sm italic mb-4 line-clamp-2" title={jewel.description}>
                                {jewel.description}
                            </p>

                            <div className="bg-purple-100 rounded-lg p-3 mb-4">
                                <p className="text-xs text-purple-600 font-semibold mb-1">Precio pagado</p>
                                <div className="flex items-center justify-center">
                                    <DollarSign size={20} className="text-purple-700 mr-1" />
                                    <p className="text-2xl font-bold text-purple-700">
                                        {formatEther(jewel.price)} ETH
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-purple-200 pt-4 mb-4">
                                <div className="flex items-center justify-center text-gray-500 text-xs">
                                    <Info size={14} className="mr-1" />
                                    <span>Creador original: {jewel.creator.slice(0, 6)}...{jewel.creator.slice(-4)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-purple-200">
                                <div className="flex items-center justify-center">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center">
                                        <Crown size={14} className="mr-2" />
                                        En tu posesión
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyJewels;