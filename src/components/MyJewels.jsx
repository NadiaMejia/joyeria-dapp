import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Gem, RefreshCw, AlertCircle, Hourglass, ExternalLink, Info, Crown, Calendar, DollarSign } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

const STORAGE_KEY = 'product_transaction_hashes';

const getTransactionHash = (productId) => {
    try {
        const hashes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return hashes[productId] || null;
    } catch (error) {
        console.error('Error leyendo hash:', error);
        return null;
    }
};

const MyJewels = ({ contract, account }) => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadMethod, setLoadMethod] = useState('');

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

            let jewels = [];
            let method = '';

            // MÉTODO 1: Usar getProductsByOwner (contrato nuevo)
            try {
                console.log('🔍 Intentando método 1: getProductsByOwner()...');
                
                if (typeof contract.getProductsByOwner === 'function') {
                    const productIds = await contract.getProductsByOwner(account);
                    console.log('📋 IDs encontrados:', productIds.map(id => Number(id)));

                    if (productIds.length > 0) {
                        method = 'getProductsByOwner';
                        
                        for (let i = 0; i < productIds.length; i++) {
                            const productId = Number(productIds[i]);
                            
                            try {
                                const product = await contract.products(productId);
                                const txHash = getTransactionHash(productId);
                                
                                jewels.push({
                                    id: productId,
                                    name: product.name || 'Sin nombre',
                                    description: product.description || 'Sin descripción',
                                    price: product.price,
                                    owner: product.owner,
                                    creator: product.creator || product.owner,
                                    isAvailable: product.isAvailable,
                                    transactionHash: txHash,
                                    purchaseDate: 'Reciente'
                                });

                                console.log(`✅ Joya ${productId} cargada`);
                            } catch (productError) {
                                console.error(`❌ Error cargando producto ${productId}:`, productError);
                            }
                        }

                        console.log(`✅ Método 1 exitoso: ${jewels.length} joyas`);
                    }
                }
            } catch (error1) {
                console.log('⚠️ Método 1 falló, intentando método 2...');
            }

            // MÉTODO 2: Leer eventos ProductSold (fallback)
            if (jewels.length === 0) {
                try {
                    console.log('🔍 Intentando método 2: Eventos...');
                    method = 'events';

                    if (contract.filters && contract.filters.ProductSold) {
                        const filter = contract.filters.ProductSold(null, null, account);
                        const events = await contract.queryFilter(filter);
                        
                        console.log(`📜 Eventos encontrados: ${events.length}`);
                        
                        for (const event of events) {
                            const productId = Number(event.args.productId);
                            
                            try {
                                const product = await contract.products(productId);
                                
                                if (Number(product.productId) !== 0) {
                                    let txHash = event.transactionHash;
                                    const storedHash = getTransactionHash(productId);
                                    if (storedHash) txHash = storedHash;
                                    
                                    jewels.push({
                                        id: productId,
                                        name: product.name || 'Sin nombre',
                                        description: product.description || 'Sin descripción',
                                        price: product.price,
                                        transactionHash: txHash,
                                        purchaseDate: 'Reciente'
                                    });

                                    console.log(`✅ Joya ${productId} cargada desde eventos`);
                                }
                            } catch (productError) {
                                console.warn(`Error: ${productError}`);
                            }
                        }

                        console.log(`✅ Método 2 exitoso: ${jewels.length} joyas`);
                    }
                } catch (error2) {
                    console.log('⚠️ Método 2 también falló');
                }
            }

            if (jewels.length === 0 && !method) {
                setError('needsUpdate');
            }

            setMyProducts(jewels);
            setLoadMethod(method);
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

    if (error === 'needsUpdate') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle size={48} className="text-orange-500 mb-4" />
                <p className="text-orange-600 font-semibold mb-2">Tu contrato necesita actualización</p>
                <div className="bg-orange-50 border border-orange-300 rounded-lg p-6 max-w-2xl">
                    <div className="flex items-start space-x-3">
                        <Info size={24} className="text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                            <p className="text-orange-700 text-sm mb-3">
                                El contrato actual no tiene la función <code className="bg-orange-100 px-1 rounded">getProductsByOwner()</code> ni eventos configurados.
                            </p>
                            <p className="text-orange-700 text-sm font-semibold">
                                Solución: Redesplegar con Joyeria_Fixed.sol
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchMyJewels}
                    className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    if (error && error !== 'needsUpdate') {
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
                    Compra joyas desde el Catálogo
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
                        {myProducts.length} {myProducts.length === 1 ? 'joya' : 'joyas'}
                        {loadMethod && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                {loadMethod === 'getProductsByOwner' ? '✓ Contrato actualizado' : 'ℹ️ Usando eventos'}
                            </span>
                        )}
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

                            {jewel.purchaseDate && (
                                <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                                    <Calendar size={12} className="mr-1" />
                                    <span>{jewel.purchaseDate}</span>
                                </div>
                            )}

                            <div className="border-t border-purple-200 pt-4">
                                {jewel.transactionHash ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 font-semibold">Hash de Compra:</p>
                                        <div 
                                            className="flex items-center justify-between bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition"
                                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${jewel.transactionHash}`, '_blank')}
                                        >
                                            <span className="text-xs font-mono text-gray-600 truncate flex-1" title={jewel.transactionHash}>
                                                {jewel.transactionHash.slice(0, 10)}...{jewel.transactionHash.slice(-8)}
                                            </span>
                                            <ExternalLink size={14} className="text-blue-500 ml-2 flex-shrink-0" />
                                        </div>
                                        <button
                                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${jewel.transactionHash}`, '_blank')}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition flex items-center justify-center"
                                        >
                                            <ExternalLink size={14} className="mr-2" />
                                            Ver en Etherscan
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center text-gray-400 text-xs py-2">
                                        <Info size={14} className="mr-1" />
                                        <span>Comprado antes del tracking</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-purple-200">
                                <div className="flex items-center justify-center">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center">
                                        <Crown size={14} className="mr-2" />
                                        Tuyo
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