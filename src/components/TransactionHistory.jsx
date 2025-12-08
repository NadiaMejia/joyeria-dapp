import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { History, RefreshCw, AlertCircle, ExternalLink, ShoppingCart, Plus, TrendingUp } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

const TransactionHistory = ({ contract, account }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadHistory = useCallback(async () => {
        if (!contract || !account) {
            console.log('⚠️ Contrato o cuenta no disponible');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('📜 Cargando historial...');
            
            let productCount = 0;
            try {
                const count = await contract.productCount();
                productCount = Number(count);
                console.log('📊 Total de productos:', productCount);
            } catch (countError) {
                console.warn('⚠️ No se pudo obtener productCount');
                productCount = 20;
            }

            const historyArray = [];
            
            // Cargar todas las transacciones relacionadas con el usuario
            for (let i = 1; i <= productCount; i++) {
                try {
                    const product = await contract.products(i);
                    
                    if (Number(product.productId) !== 0) {
                        const accountLower = account.toLowerCase();
                        const productOwner = product.owner ? product.owner.toLowerCase() : '';
                        
                        console.log(`Producto ${i}:`, {
                            name: product.name,
                            owner: productOwner,
                            isAvailable: product.isAvailable,
                            currentAccount: accountLower,
                            match: productOwner === accountLower
                        });
                        
                        // Obtener hash
                        let txHash = 'N/A';
                        try {
                            const hashIndex = i - 1;
                            txHash = await contract.transactionHashes(hashIndex);
                        } catch (hashError) {
                            console.warn(`⚠️ No se pudo obtener hash para producto ${i}`);
                        }

                        // Si el usuario es el owner Y el producto está disponible = LO CREÓ
                        if (productOwner === accountLower && product.isAvailable) {
                            console.log(`✅ Transacción de CREACIÓN encontrada: ${product.name}`);
                            historyArray.push({
                                id: `create-${product.productId}`,
                                productId: Number(product.productId),
                                productName: product.name || 'Sin nombre',
                                type: 'create',
                                typeLabel: 'Creación',
                                price: product.price,
                                hash: txHash,
                                date: new Date().toLocaleDateString(),
                                status: 'En venta'
                            });
                        }

                        // Si el usuario es el owner Y el producto NO está disponible = LO COMPRÓ
                        if (productOwner === accountLower && !product.isAvailable) {
                            console.log(`✅ Transacción de COMPRA encontrada: ${product.name}`);
                            historyArray.push({
                                id: `buy-${product.productId}`,
                                productId: Number(product.productId),
                                productName: product.name || 'Sin nombre',
                                type: 'buy',
                                typeLabel: 'Compra',
                                price: product.price,
                                hash: txHash,
                                date: new Date().toLocaleDateString(),
                                status: 'Completado'
                            });
                        }
                    } else {
                        console.log(`Producto ${i} vacío, deteniendo`);
                        break;
                    }
                } catch (productError) {
                    console.log(`⏭️ Error o fin en índice ${i}:`, productError.message);
                    break;
                }
            }

            // Ordenar por fecha (más recientes primero) - en producción usarías timestamps reales
            historyArray.reverse();

            console.log(`✅ Historial cargado: ${historyArray.length} transacciones`);
            setTransactions(historyArray);
            setError('');

        } catch (err) {
            console.error('❌ Error al cargar historial:', err);
            setError(`No se pudo cargar el historial: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    }, [contract, account]);

    useEffect(() => {
        console.log('🔄 TransactionHistory montado, iniciando carga...');
        loadHistory();
    }, [loadHistory]);

    const openEtherscan = (hash) => {
        window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'create':
                return <Plus size={20} className="text-blue-500" />;
            case 'buy':
                return <ShoppingCart size={20} className="text-green-500" />;
            default:
                return <TrendingUp size={20} className="text-gray-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'create':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'buy':
                return 'bg-green-100 text-green-700 border-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    // Estado de carga
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <History size={48} className="text-pink-500 animate-spin mb-4" />
                <p className="text-xl text-pink-600">Cargando historial...</p>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error al cargar historial</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                    onClick={loadHistory}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    // Sin transacciones
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <History size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-xl font-semibold mb-2">
                    Sin transacciones aún
                </p>
                <p className="text-gray-400 mb-4">
                    Crea o compra artículos para ver tu historial
                </p>
                <button
                    onClick={loadHistory}
                    className="text-pink-500 hover:text-pink-600 flex items-center text-sm"
                >
                    <RefreshCw size={14} className="mr-2" />
                    Actualizar
                </button>
            </div>
        );
    }

    // Historial de transacciones
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-pink-600 flex items-center">
                    <History size={28} className="mr-2" />
                    Historial de Transacciones ({transactions.length})
                </h3>
                <button
                    onClick={loadHistory}
                    className="text-gray-600 hover:text-pink-600 flex items-center text-sm transition"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Actualizar
                </button>
            </div>

            {/* Tabla de transacciones */}
            <div className="bg-white rounded-xl shadow-xl border border-pink-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Monto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-pink-50 transition">
                                    {/* Tipo */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getTypeIcon(tx.type)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(tx.type)}`}>
                                                {tx.typeLabel}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Producto */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-800">{tx.productName}</p>
                                            <p className="text-xs text-gray-500">ID: {tx.productId}</p>
                                        </div>
                                    </td>

                                    {/* Monto */}
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-pink-600">
                                            {formatEther(tx.price)} ETH
                                        </span>
                                    </td>

                                    {/* Fecha */}
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {tx.date}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            {tx.status}
                                        </span>
                                    </td>

                                    {/* Acción */}
                                    <td className="px-6 py-4 text-center">
                                        {tx.hash && tx.hash !== 'N/A' && tx.hash.startsWith('0x') ? (
                                            <button
                                                onClick={() => openEtherscan(tx.hash)}
                                                className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition"
                                                title="Ver en Etherscan"
                                            >
                                                <ExternalLink size={12} className="mr-1" />
                                                Ver
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumen */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Productos Creados</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {transactions.filter(tx => tx.type === 'create').length}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold mb-1">Productos Comprados</p>
                    <p className="text-2xl font-bold text-green-700">
                        {transactions.filter(tx => tx.type === 'buy').length}
                    </p>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <p className="text-sm text-pink-600 font-semibold mb-1">Total Transacciones</p>
                    <p className="text-2xl font-bold text-pink-700">
                        {transactions.length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;