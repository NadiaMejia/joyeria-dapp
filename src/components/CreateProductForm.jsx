import React, { useState } from 'react';
import { Gem, FileText, DollarSign } from 'lucide-react';

const CreateProductForm = ({ onCreateProduct, isCreating = false }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación en el frontend
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();
        const trimmedPrice = price.trim();

        if (!trimmedName) {
            alert("❌ El nombre del artículo es obligatorio.");
            return;
        }

        if (!trimmedDescription) {
            alert("❌ La descripción del artículo es obligatoria.");
            return;
        }

        if (!trimmedPrice || trimmedPrice === '') {
            alert("❌ El precio es obligatorio.");
            return;
        }

        // Validar que el precio sea un número válido
        const priceNumber = parseFloat(trimmedPrice);
        
        if (isNaN(priceNumber)) {
            alert("❌ El precio debe ser un número válido. Usa solo números y punto decimal.");
            return;
        }

        if (priceNumber <= 0) {
            alert("❌ El precio debe ser mayor que 0.");
            return;
        }

        if (priceNumber > 1000000) {
            alert("⚠️ ¿Estás seguro? El precio parece muy alto.");
            return;
        }

        try {
            // Enviar los datos al componente padre (App.jsx)
            await onCreateProduct({
                name: trimmedName,
                description: trimmedDescription,
                price: trimmedPrice, // Enviar como string limpio
            });

            // Limpiar el formulario solo si fue exitoso
            setName('');
            setDescription('');
            setPrice('');

        } catch (error) {
            console.error("Error en el formulario:", error);
            // El error ya se maneja en App.jsx
        }
    };

    // Manejar cambio de precio con validación en tiempo real
    const handlePriceChange = (e) => {
        let value = e.target.value;
        
        // Permitir solo números, punto decimal y un solo punto
        value = value.replace(/[^\d.]/g, '');
        
        // Evitar múltiples puntos decimales
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        setPrice(value);
    };

    return (
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-xl border border-pink-100">
            <h3 className="text-2xl font-bold text-pink-600 mb-6 border-b pb-3">
                Detalles del Nuevo Artículo
            </h3>
            
            {/* Campo de Nombre */}
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Gem size={16} className="mr-2 text-pink-500"/>
                    Nombre del Artículo *
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border-2 border-pink-200 bg-white text-gray-800 p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
                    placeholder="Ej: Collar de Diamantes"
                    disabled={isCreating}
                    maxLength={100}
                />
                <p className="text-xs text-gray-500">Máximo 100 caracteres</p>
            </div>

            {/* Campo de Descripción */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileText size={16} className="mr-2 text-pink-500"/>
                    Descripción Detallada *
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border-2 border-pink-200 bg-white text-gray-800 p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
                    rows={4}
                    placeholder="Describe las características, materiales, peso, etc."
                    disabled={isCreating}
                    maxLength={500}
                />
                <p className="text-xs text-gray-500">Máximo 500 caracteres</p>
            </div>

            {/* Campo de Precio */}
            <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign size={16} className="mr-2 text-pink-500"/>
                    Precio Inicial (en ETH) *
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="price"
                        value={price}
                        onChange={handlePriceChange}
                        className="w-full rounded-lg border-2 border-pink-200 bg-white text-gray-800 p-3 focus:ring-pink-500 focus:border-pink-500 transition duration-200 shadow-sm"
                        placeholder="0.001"
                        disabled={isCreating}
                    />
                    <span className="absolute right-3 top-3 text-gray-400 font-mono">ETH</span>
                </div>
                <p className="text-xs text-gray-500">
                    Usa punto (.) para decimales. Ejemplo: 0.05 ETH
                </p>
                {price && parseFloat(price) > 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                        ≈ {parseFloat(price).toFixed(6)} ETH
                    </p>
                )}
            </div>

            {/* Botón de Submit */}
            <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:shadow-lg shadow-pink-300/50 flex items-center justify-center"
            >
                {isCreating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando Transacción...
                    </>
                ) : (
                    '✨ Crear Artículo Precioso'
                )}
            </button>

            {/* Nota informativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Nota:</strong> La creación del producto requiere una transacción en la blockchain. 
                    Confirma la transacción en Metamask y espera la confirmación (puede tardar unos segundos).
                </p>
            </div>
        </div>
    );
};

export default CreateProductForm;