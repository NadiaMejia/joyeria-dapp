import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract/constants";
import ProductList from "./components/ProductList.jsx";
import CreateProductForm from "./components/CreateProductForm.jsx";
import MyJewels from "./components/MyJewels.jsx";
import TransactionHistory from "./components/TransactionHistory.jsx";
import { Coins, PlusCircle, Wallet, Gem, History, LogOut, Sparkles, Shield, Zap, Crown, Star } from 'lucide-react';

// Vista de Home completamente rediseñada con tema de lujo oscuro
const HomeView = ({ connectWallet, loading }) => (
  <div className="relative min-h-screen overflow-hidden">
    {/* Fondo con gradiente animado */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '700ms'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1000ms'}}></div>
      </div>
    </div>

    {/* Contenido principal */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
      {/* Logo animado con efecto de brillo */}
      <div className="relative mb-12 group">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-full shadow-2xl">
          <Crown size={100} className="text-yellow-400 filter drop-shadow-2xl" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles size={32} className="text-yellow-400 animate-spin" style={{animationDuration: '3s'}} />
        </div>
      </div>

      {/* Título con efecto de neón */}
      <div className="text-center mb-8">
        <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 filter drop-shadow-lg">
            AURUM
          </span>
        </h1>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Star size={20} className="text-yellow-400 animate-pulse" />
          <p className="text-2xl md:text-3xl font-light text-gray-300 tracking-widest uppercase">
            Luxury Blockchain
          </p>
          <Star size={20} className="text-yellow-400 animate-pulse" />
        </div>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Marketplace exclusivo de joyería de lujo certificada en blockchain Ethereum
        </p>
      </div>

      {/* Features cards con diseño premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full px-4">
        <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-pink-500 transition duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition duration-300">
              <Shield size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Seguridad Total</h3>
            <p className="text-gray-400 text-sm">Smart contracts auditados y blockchain inmutable</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition duration-300">
              <Gem size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Piezas Únicas</h3>
            <p className="text-gray-400 text-sm">Joyería exclusiva con certificado digital</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-yellow-500 transition duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition duration-300">
              <Zap size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Transacciones Rápidas</h3>
            <p className="text-gray-400 text-sm">Compra y vende en segundos con Web3</p>
          </div>
        </div>
      </div>

      {/* Botón de conexión premium */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
        <button
          onClick={connectWallet}
          disabled={loading}
          className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-5 px-12 rounded-full transition duration-300 text-xl flex items-center shadow-2xl disabled:opacity-50"
        >
          <Wallet size={28} className="mr-3" />
          {loading ? 'Inicializando...' : 'Conectar Wallet'}
        </button>
      </div>

      <p className="text-gray-500 text-sm mt-8 flex items-center">
        <Shield size={14} className="mr-2" />
        Powered by Ethereum • Requiere MetaMask
      </p>
    </div>
  </div>
);

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [creatingProduct, setCreatingProduct] = useState(false);

  const tabs = [
    { id: 'inventory', label: 'Catálogo', icon: Coins },
    { id: 'myJewels', label: 'Mi Colección', icon: Gem },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'create', label: 'Publicar', icon: PlusCircle },
  ];

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        setProvider(newProvider);
        setSigner(newSigner);

        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
        setContract(newContract);
        setError('');
        setActiveTab('inventory');
      } catch (err) {
        console.error("Error al conectar la wallet:", err);
        setError(`Error al conectar Metamask: ${err.message || "Asegúrate de tener la extensión instalada."}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Metamask no está instalado.");
      setLoading(false);
    }
  }, []);

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setProvider(null);
    setActiveTab('inventory');
    setError('');
  };

  useEffect(() => {
    setLoading(false);

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        connectWallet();
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [connectWallet]);

  const handleCreateProduct = async (productData) => {
    if (!contract) {
      setError("Contrato no inicializado. Conecta la wallet.");
      return;
    }

    setError('');
    setCreatingProduct(true);

    try {
      if (!productData.name || productData.name.trim() === '') {
        throw new Error("El nombre del producto es obligatorio.");
      }
      if (!productData.description || productData.description.trim() === '') {
        throw new Error("La descripción del producto es obligatoria.");
      }

      let priceString = productData.price ? productData.price.toString().trim() : '0';
      priceString = priceString.replace(/,/g, '.');
      priceString = priceString.replace(/\s/g, '');
      if (!priceString || priceString === '.') {
        priceString = '0';
      }

      const priceFloat = parseFloat(priceString);
      if (isNaN(priceFloat) || !isFinite(priceFloat)) {
        throw new Error(`El precio "${priceString}" no es un número válido.`);
      }
      if (priceFloat < 0) {
        throw new Error("El precio no puede ser negativo.");
      }

      const priceInWei = ethers.parseEther(priceString);

      const tx = await contract.createProduct(
        productData.name.trim(),
        productData.description.trim(),
        priceInWei,
        "IPFS_Hash_" + Date.now().toString()
      );

      const verEnEtherscan = confirm(
        `⏳ Producto enviado!\n\nHash: ${tx.hash}\n\n¿Ver en Sepolia Etherscan?`
      );

      if (verEnEtherscan) {
        window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank');
      }

      await tx.wait();

      alert(`✅ Producto creado!\n\nHash: ${tx.hash}`);

      const verDeNuevo = confirm('¿Ver transacción confirmada en Etherscan?');
      if (verDeNuevo) {
        window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank');
      }

      setActiveTab('inventory');
      setError('');
    } catch (err) {
      console.error("Error al crear el producto:", err);
      let errorMessage = "Error desconocido.";

      if (err.message) {
        errorMessage = err.message;
      }
      if (err.code === 'INVALID_ARGUMENT') {
        errorMessage = "❌ Error de formato.";
      } else if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        errorMessage = "❌ Transacción rechazada.";
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = "❌ Fondos insuficientes.";
      } else if (err.reason) {
        errorMessage = `❌ ${err.reason}`;
      }

      setError(errorMessage);
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-purple-50">
      {/* HEADER Premium */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg">
                  <Crown size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  AURUM
                </h1>
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">Luxury Blockchain</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {account ? (
                <>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 rounded-full shadow-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-mono text-sm text-white font-semibold">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Salir
                  </button>
                </>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition flex items-center"
                >
                  <Wallet size={16} className="mr-2" />
                  {loading ? 'Conectando...' : 'Conectar'}
                </button>
              )}
            </div>
          </div>

          {account && (
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={creatingProduct}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={account ? 'pt-40 px-6 pb-20' : ''}>
        {!account && <HomeView connectWallet={connectWallet} loading={loading} />}

        {account && (
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 p-4 rounded-xl mb-6 shadow-lg">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
                <button onClick={() => setError('')} className="mt-2 text-sm underline">Cerrar</button>
              </div>
            )}

            {creatingProduct && (
              <div className="bg-blue-100 border-2 border-blue-400 text-blue-700 p-4 rounded-xl mb-6 shadow-lg">
                <p className="font-bold">⏳ Creando producto...</p>
                <p className="text-sm">Confirma en Metamask y espera.</p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200 min-h-[600px]">
              {activeTab === 'inventory' && <ProductList contract={contract} account={account} />}
              {activeTab === 'myJewels' && <MyJewels contract={contract} account={account} />}
              {activeTab === 'history' && <TransactionHistory contract={contract} account={account} />}
              {activeTab === 'create' && (
                <CreateProductForm onCreateProduct={handleCreateProduct} isCreating={creatingProduct} />
              )}
            </div>
          </div>
        )}
      </main>

      {account && (
        <footer className="text-center py-8 border-t border-gray-200 bg-white/50">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Crown size={16} className="text-pink-500" />
            <p>© 2024 AURUM • Luxury Blockchain Marketplace</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Powered by Ethereum & Sepolia Testnet</p>
        </footer>
      )}
    </div>
  );
};

export default App;