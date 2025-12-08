import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { History, RefreshCw, AlertCircle, ShoppingCart, Plus } from 'lucide-react';

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
            
            const count = await contract.productCount();
            const productCount = Number(count);
            console.log('📊 Total de productos:', productCount);

            const historyArray = [];
            
            // Cargar todas las transacciones relacionadas con el usuario
            for (let i = 1; i <= productCount; i++) {
                try {
                    const product = await contract.products(i);
                    
                    if (Number(product.productId) !== 0) {
                        const accountLower = account.toLowerCase();
                        const productOwner = product.owner ? product.owner.toLowerCase() : '';
                        const productCreator = product.creator ? product.creator.toLowerCase() : '';
                        
                        // Si el usuario CREÓ el producto (es el creator)
                        if (productCreator === accountLower) {
                            console.log(`✅ Transacción de CREACIÓN encontrada: ${product.name}`);
                            historyArray.push({
                                id: `create-${product.productId}`,
                                productId: Number(product.productId),
                                productName: product.name || 'Sin nombre',
                                type: 'create',
                                typeLabel: 'Creación',
                                price: product.price,
                                date: new Date().toLocaleDateString(),
                                status: product.isAvailable ? 'En venta' : 'Vendido'
                            });
                        }

                        // Si el usuario COMPRÓ el producto (es owner pero NO creator)
                        if (productOwner === accountLower && productCreator !== accountLower && !product.isAvailable) {
                            console.log(`✅ Transacción de COMPRA encontrada: ${product.name}`);
                            historyArray.push({
                                id: `buy-${product.productId}`,
                                productId: Number(product.productId),
                                productName: product.name || 'Sin nombre',
                                type: 'buy',
                                typeLabel: 'Compra',
                                price: product.price,
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

            // Ordenar por ID descendente (más recientes primero)
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

    const getTypeIcon = (type) => {
        switch(type) {
            case 'create':
                return <Plus size={20} className="text-blue-500" />;
            case 'buy':
                return <ShoppingCart size={20} className="text-green-500" />;
            default:
                return null;
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <History size={48} className="text-pink-500 animate-spin mb-4" />
                <p className="text-xl text-pink-600">Cargando historial...</p>
            </div>
        );
    }

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-pink-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getTypeIcon(tx.type)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(tx.type)}`}>
                                                {tx.typeLabel}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-800">{tx.productName}</p>
                                            <p className="text-xs text-gray-500">ID: {tx.productId}</p>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="font-bold text-pink-600">
                                            {formatEther(tx.price)} ETH
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {tx.date}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            tx.status === 'Completado' || tx.status === 'Vendido'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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