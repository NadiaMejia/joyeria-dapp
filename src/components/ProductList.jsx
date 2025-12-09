import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Tag, Zap, Hourglass, RefreshCw, AlertCircle, Info, ExternalLink, CheckCircle, FileText } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

const ProductList = ({ contract, account }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [productTransactions, setProductTransactions] = useState({});

    // Modal para Etherscan
    const [txModal, setTxModal] = useState({
        open: false,
        hash: "",
        status: "pending" // pending, confirmed, failed
    });

    // 🔥 Función para obtener el hash de transacción de un producto desde los eventos del contrato
    const fetchProductTransactionHash = useCallback(async (productId) => {
        if (!contract) return null;

        try {
            // Intentar obtener eventos de compra para este producto
            const filter = contract.filters.ProductSold(productId);
            const events = await contract.queryFilter(filter);
            
            if (events.length > 0) {
                // Retornar el hash de la última transacción
                return events[events.length - 1].transactionHash;
            }
        } catch (err) {
            console.error(`Error al obtener hash para producto ${productId}:`, err);
        }
        
        return null;
    }, [contract]);

    const fetchProducts = useCallback(async () => {
        if (!contract) {
            console.log('⚠️ Contrato no disponible');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const count = await contract.productCount();
            const productCount = Number(count);

            const fetchedProducts = [];
            const txHashes = {};
            
            for (let i = 1; i <= productCount; i++) {
                try {
                    const product = await contract.products(i);
                    
                    if (Number(product.productId) !== 0) {
                        const productData = {
                            id: Number(product.productId),
                            name: product.name || 'Sin nombre',
                            description: product.description || 'Sin descripción',
                            price: product.price,
                            isAvailable: product.isAvailable,
                            owner: product.owner,
                            creator: product.creator || product.owner
                        };
                        
                        fetchedProducts.push(productData);

                        // 🔥 Si el producto está vendido, buscar su hash
                        if (!product.isAvailable) {
                            const txHash = await fetchProductTransactionHash(i);
                            if (txHash) {
                                txHashes[i] = txHash;
                            }
                        }
                    } else {
                        break;
                    }
                } catch {
                    break;
                }
            }

            setProducts(fetchedProducts);
            setProductTransactions(txHashes);
            setError('');

        } catch (err) {
            console.error('❌ Error al cargar productos:', err);
            setError(`No se pudieron cargar los productos: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    }, [contract, fetchProductTransactionHash]);

    const handleBuy = async (productId, price) => {
        if (!contract) {
            alert('❌ Contrato no disponible');
            return;
        }

        try {
            const tx = await contract.buyProduct(productId, { value: price });

            // 👉 Mostrar modal con estado pendiente
            setTxModal({
                open: true,
                hash: tx.hash,
                status: "pending"
            });

            // ✔ Guardar hash inmediatamente en el estado local
            setProductTransactions(prev => ({
                ...prev,
                [productId]: tx.hash
            }));

            // Esperar confirmación
            const receipt = await tx.wait();

            // Actualizar modal con estado confirmado
            setTxModal(prev => ({
                ...prev,
                status: receipt.status === 1 ? "confirmed" : "failed"
            }));

            // Recargar productos
            await fetchProducts();

        } catch (err) {
            const errorMsg = err.reason || err.message || 'Error desconocido';
            alert(`❌ Fallo en la compra: ${errorMsg}`);
            setTxModal({ open: false, hash: "", status: "pending" });
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Hourglass size={48} className="text-pink-500 animate-spin mb-4" />
                <p className="text-xl text-pink-600">Cargando tesoros del inventario...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error al cargar productos</p>
                <p className="text-gray-600 text-sm mb-4">{error}</p>
                <button
                    onClick={fetchProducts}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition flex items-center"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-pink-600">
                    Artículos Disponibles ({products.length})
                </h3>
                <button
                    onClick={fetchProducts}
                    className="text-gray-600 hover:text-pink-600 flex items-center text-sm transition"
                >
                    <RefreshCw size={16} className="mr-2" />
                    Actualizar
                </button>
            </div>

            <div className="shadow-2xl rounded-2xl overflow-hidden border border-pink-100">
                <div className="grid grid-cols-12 gap-4 p-5 text-sm font-bold uppercase bg-gray-100 text-gray-600 border-b border-gray-200">
                    <div className="col-span-2">Artículo</div>
                    <div className="col-span-3">Descripción</div>
                    <div className="col-span-2 text-center">Precio (ETH)</div>
                    <div className="col-span-2 text-center">Estado</div>
                    <div className="col-span-3 text-right">Acción / Hash</div>
                </div>

                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`grid grid-cols-12 gap-4 items-center p-5 border-b border-gray-100
                                    ${product.isAvailable ? 'bg-gradient-to-r from-white to-pink-50 hover:bg-pink-100' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                        <div className="col-span-2 font-semibold text-lg flex items-center">
                            <Tag size={18} className="text-pink-500 mr-2 flex-shrink-0" />
                            <span className="truncate">{product.name}</span>
                        </div>

                        <div className="col-span-3 text-sm italic text-gray-500 truncate">
                            {product.description}
                        </div>

                        <div className="col-span-2 text-center font-bold text-lg text-pink-700">
                            {formatEther(product.price)}
                        </div>

                        <div className="col-span-2 text-center">
                            {product.isAvailable ? (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300 shadow-md">
                                    🟢 En Venta
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 shadow-md">
                                    🔴 Vendido
                                </span>
                            )}
                        </div>

                        <div className="col-span-3 text-right">
                            {product.isAvailable ? (
                                <button
                                    onClick={() => handleBuy(product.id, product.price)}
                                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full text-sm transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-end ml-auto"
                                >
                                    <Zap size={16} className="mr-1" /> Comprar
                                </button>
                            ) : (
                                <div className="flex flex-col items-end space-y-2">
                                    {productTransactions[product.id] ? (
                                        <>
                                            {/* Badge de confirmación */}
                                            <div className="flex items-center text-green-600 text-xs font-semibold">
                                                <CheckCircle size={14} className="mr-1" />
                                                <span>Transacción registrada</span>
                                            </div>
                                            
                                            {/* 🆕 Botón permanente para ver en Etherscan */}
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${productTransactions[product.id]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 transform hover:scale-105 shadow-lg flex items-center"
                                            >
                                                <FileText size={14} className="mr-1" />
                                                Ver TX en Etherscan
                                            </a>
                                            
                                            {/* Hash corto (opcional - para mostrar el hash también) */}
                                            <div className="text-gray-500 font-mono text-[10px] bg-gray-100 px-2 py-1 rounded">
                                                {productTransactions[product.id].slice(0, 10)}...{productTransactions[product.id].slice(-8)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-end text-gray-400 text-xs">
                                            <Info size={14} className="mr-1" />
                                            <span>Vendido • Hash no disponible</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {txModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-pink-200">
                        
                        {txModal.status === "pending" && (
                            <>
                                <div className="flex items-center justify-center mb-4">
                                    <Hourglass size={48} className="text-yellow-500 animate-spin" />
                                </div>
                                <h2 className="text-xl font-bold text-yellow-600 mb-4 text-center">
                                    Transacción en proceso ⏳
                                </h2>
                                <p className="text-gray-700 text-sm mb-4 text-center">
                                    Tu compra está siendo procesada en la blockchain. Por favor espera...
                                </p>
                            </>
                        )}

                        {txModal.status === "confirmed" && (
                            <>
                                <div className="flex items-center justify-center mb-4">
                                    <CheckCircle size={48} className="text-green-500" />
                                </div>
                                <h2 className="text-xl font-bold text-green-600 mb-4 text-center">
                                    ¡Compra exitosa! ✅
                                </h2>
                                <p className="text-gray-700 text-sm mb-4 text-center">
                                    Tu transacción ha sido confirmada en la blockchain.
                                </p>
                            </>
                        )}

                        {txModal.status === "failed" && (
                            <>
                                <div className="flex items-center justify-center mb-4">
                                    <AlertCircle size={48} className="text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
                                    Transacción fallida ❌
                                </h2>
                                <p className="text-gray-700 text-sm mb-4 text-center">
                                    Hubo un problema al procesar tu compra.
                                </p>
                            </>
                        )}

                        <div className="bg-gray-100 rounded-xl p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Hash de transacción:</p>
                            <p className="text-xs text-gray-700 break-all font-mono">{txModal.hash}</p>
                        </div>

                        <a
                            href={`https://sepolia.etherscan.io/tx/${txModal.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl text-center transition mb-3 flex items-center justify-center"
                        >
                            <ExternalLink size={18} className="mr-2" />
                            Ver en Etherscan
                        </a>

                        <button
                            onClick={() => setTxModal({ open: false, hash: "", status: "pending" })}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;