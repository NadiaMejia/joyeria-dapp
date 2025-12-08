import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Tag, Zap, Hourglass, RefreshCw, AlertCircle, Info, ExternalLink } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

const ProductList = ({ contract, account }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal para Etherscan
    const [txModal, setTxModal] = useState({
        open: false,
        hash: ""
    });

    // 💾 Guardar hash por producto
    const [productTxHash, setProductTxHash] = useState({});

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
            
            for (let i = 1; i <= productCount; i++) {
                try {
                    const product = await contract.products(i);
                    
                    if (Number(product.productId) !== 0) {
                        fetchedProducts.push({
                            id: Number(product.productId),
                            name: product.name || 'Sin nombre',
                            description: product.description || 'Sin descripción',
                            price: product.price,
                            isAvailable: product.isAvailable,
                            owner: product.owner,
                            creator: product.creator || product.owner
                        });
                    } else {
                        break;
                    }
                } catch {
                    break;
                }
            }

            setProducts(fetchedProducts);
            setError('');

        } catch (err) {
            console.error('❌ Error al cargar productos:', err);
            setError(`No se pudieron cargar los productos: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    }, [contract]);

    const handleBuy = async (productId, price) => {
        if (!contract) {
            alert('❌ Contrato no disponible');
            return;
        }

        try {
            const tx = await contract.buyProduct(productId, { value: price });

            // ✔ Guardar hash para mostrarlo después en la tabla
            setProductTxHash(prev => ({
                ...prev,
                [productId]: tx.hash
            }));

            // 👉 Mostrar modal
            setTxModal({
                open: true,
                hash: tx.hash
            });

            await tx.wait();

            await fetchProducts();

        } catch (err) {
            const errorMsg = err.reason || err.message || 'Error desconocido';
            alert(`❌ Fallo en la compra: ${errorMsg}`);
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
                    <div className="col-span-3">Artículo</div>
                    <div className="col-span-3">Descripción</div>
                    <div className="col-span-2 text-center">Precio (ETH)</div>
                    <div className="col-span-2 text-center">Estado</div>
                    <div className="col-span-2 text-right">Acción</div>
                </div>

                {products.map((product) => (
                    <div
                        key={product.id}
                        className={`grid grid-cols-12 gap-4 items-center p-5 border-b border-gray-100
                                    ${product.isAvailable ? 'bg-gradient-to-r from-white to-pink-50 hover:bg-pink-100' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                        <div className="col-span-3 font-semibold text-lg flex items-center">
                            <Tag size={18} className="text-pink-500 mr-2" />
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

                        <div className="col-span-2 text-right">
                            {product.isAvailable ? (
                                <button
                                    onClick={() => handleBuy(product.id, product.price)}
                                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full text-sm transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-end ml-auto"
                                >
                                    <Zap size={16} className="mr-1" /> Comprar
                                </button>
                            ) : (
                                productTxHash[product.id] ? (
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${productTxHash[product.id]}`}
                                        target="_blank"
                                        className="text-pink-600 hover:text-pink-700 font-semibold text-sm flex items-center justify-end"
                                    >
                                        <ExternalLink size={16} className="mr-1" /> Ver Hash
                                    </a>
                                ) : (
                                    <div className="flex items-center justify-end text-gray-400 text-xs">
                                        <Info size={14} className="mr-1" />
                                        <span>Vendido</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {txModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 border border-pink-200">
                        
                        <h2 className="text-xl font-bold text-pink-600 mb-4 text-center">
                            Transacción enviada 🚀
                        </h2>

                        <p className="text-gray-700 text-sm mb-4 text-center">
                            Tu compra está procesándose en la blockchain.
                        </p>

                        <div className="bg-gray-100 rounded-xl p-3 text-xs text-gray-500 break-all mb-4">
                            {txModal.hash}
                        </div>

                        <a
                            href={`https://sepolia.etherscan.io/tx/${txModal.hash}`}
                            target="_blank"
                            className="block w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-xl text-center transition"
                        >
                            Ver en Etherscan
                        </a>

                        <button
                            onClick={() => setTxModal({ open: false, hash: "" })}
                            className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl transition"
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
