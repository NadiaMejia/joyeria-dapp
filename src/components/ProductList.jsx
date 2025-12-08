import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Tag, Zap, Hourglass, RefreshCw, AlertCircle, ExternalLink, Info } from 'lucide-react';

const formatEther = (wei) => {
    return ethers.formatEther(wei);
};

// Funciones para localStorage
const STORAGE_KEY = 'product_transaction_hashes';

const saveTransactionHash = (productId, txHash) => {
    try {
        const hashes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        hashes[productId] = txHash;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hashes));
        console.log(`💾 Hash guardado para producto ${productId}:`, txHash);
    } catch (error) {
        console.error('Error guardando hash:', error);
    }
};

const getTransactionHash = (productId) => {
    try {
        const hashes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return hashes[productId] || null;
    } catch (error) {
        console.error('Error leyendo hash:', error);
        return null;
    }
};

const ProductList = ({ contract, account }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchProducts = useCallback(async () => {
        if (!contract) {
            console.log('⚠️ Contrato no disponible');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('📦 Iniciando carga de productos...');
            
            let productCount = 0;
            try {
                const count = await contract.productCount();
                productCount = Number(count);
                console.log('📊 Total de productos:', productCount);
            } catch (countError) {
                console.warn('⚠️ No se pudo obtener productCount');
                productCount = 20;
            }

            const fetchedProducts = [];
            
            for (let i = 1; i <= productCount; i++) { 
                try {
                    const product = await contract.products(i);
                    
                    if (Number(product.productId) !== 0) {
                        const productId = Number(product.productId);
                        const isAvailable = product.isAvailable !== undefined ? product.isAvailable : true;
                        
                        let txHash = null;
                        if (!isAvailable) {
                            txHash = getTransactionHash(productId);
                        }

                        fetchedProducts.push({
                            id: productId,
                            name: product.name || 'Sin nombre',
                            description: product.description || 'Sin descripción',
                            price: product.price,
                            isAvailable: isAvailable,
                            owner: product.owner,
                            creator: product.creator || product.owner,
                            transactionHash: txHash
                        });
                    } else {
                        break;
                    }
                } catch (productError) {
                    console.log(`⏭️ Fin de productos en índice ${i}`);
                    break;
                }
            }

            console.log(`✅ ${fetchedProducts.length} productos cargados`);
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
            console.log(`💰 Iniciando compra del producto ${productId}...`);
            
            const tx = await contract.buyProduct(productId, {
                value: price,
            });

            console.log('📤 Hash de transacción:', tx.hash);

            // Guardar hash en localStorage
            saveTransactionHash(productId, tx.hash);

            // Actualizar UI inmediatamente
            setProducts(prevProducts => 
                prevProducts.map(p => 
                    p.id === productId 
                        ? { ...p, transactionHash: tx.hash, isAvailable: false }
                        : p
                )
            );

            const verEnEtherscan = confirm(
                `⏳ Transacción enviada!\n\nHash: ${tx.hash}\n\n¿Quieres ver la transacción en Sepolia Etherscan?`
            );

            if (verEnEtherscan) {
                window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank');
            }

            await tx.wait();
            console.log('✅ Transacción confirmada');
            
            alert(`✅ ¡Compra exitosa!\n\nEl producto ahora es tuyo.\n\nHash: ${tx.hash}`);
            
            fetchProducts(); 

        } catch (err) {
            console.error('❌ Error en la compra:', err);
            const errorMsg = err.reason || err.message || 'Error desconocido';
            alert(`❌ Fallo en la compra: ${errorMsg}`);
            
            fetchProducts();
        }
    };
    
    useEffect(() => {
        console.log('🔄 ProductList montado');
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

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Tag size={64} className="text-gray-300 mb-4" />
                <p className="text-gray-500 text-xl font-semibold mb-2">
                    El inventario está vacío
                </p>
                <p className="text-gray-400 mb-4">
                    Crea tu primer artículo desde la pestaña "Crear Artículo"
                </p>
                <button
                    onClick={fetchProducts}
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
                        className={`grid grid-cols-12 gap-4 items-center p-5 text-gray-800 transition duration-300 border-b border-gray-100 
                                    ${product.isAvailable ? 'bg-gradient-to-r from-white to-pink-50 hover:bg-pink-100' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                        <div className="col-span-3 font-semibold text-lg flex items-center">
                            <Tag size={18} className="text-pink-500 mr-2"/>
                            <span className="truncate" title={product.name}>
                                {product.name}
                            </span>
                        </div>

                        <div className="col-span-3 text-sm italic text-gray-500 truncate" title={product.description}>
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
                                <div className="flex flex-col items-end space-y-2">
                                    {product.transactionHash ? (
                                        <>
                                            <span 
                                                className="text-blue-600 text-xs font-mono truncate max-w-[120px] cursor-pointer hover:text-blue-800 hover:underline" 
                                                title={`Click para ver: ${product.transactionHash}`}
                                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${product.transactionHash}`, '_blank')}
                                            >
                                                {product.transactionHash.slice(0, 6)}...{product.transactionHash.slice(-4)}
                                            </span>
                                            <button
                                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${product.transactionHash}`, '_blank')}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition duration-300 flex items-center shadow-md hover:shadow-lg"
                                            >
                                                <ExternalLink size={12} className="mr-1" />
                                                Ver TX
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-end space-y-1">
                                            <div className="flex items-center text-gray-400 text-xs">
                                                <Info size={14} className="mr-1" />
                                                <span>Comprado antes</span>
                                            </div>
                                            <span className="text-gray-400 text-[10px]">
                                                (Sin registro de TX)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;