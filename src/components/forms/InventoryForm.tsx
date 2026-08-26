import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const CATEGORIES = ['Materia Prima', 'Herramientas', 'Empaque', 'Oficina', 'Otro'];
const UNITS = ['unidad', 'kg', 'litro', 'metro', 'caja', 'otro'];

interface InventoryFormProps {
  initialValues?: {
    name: string;
    description?: string;
    category: string;
    quantity: number;
    unit: string;
    purchasePriceUSD: number;
    supplier?: string;
    purchaseDate: string;
    notes?: string;
    photoUri?: string;
    lowStockThreshold?: number;
  };
  exchangeRate: number | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    category: string;
    quantity: number;
    unit: string;
    purchasePriceUSD: number;
    supplier?: string;
    purchaseDate: string;
    notes?: string;
    photoUri?: string;
    lowStockThreshold?: number;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function InventoryForm({ initialValues, exchangeRate, onSubmit, onCancel, isSubmitting }: InventoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? CATEGORIES[0]);
  const [quantity, setQuantity] = useState(initialValues?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(initialValues?.unit ?? UNITS[0]);
  const [purchasePriceUSD, setPurchasePriceUSD] = useState(initialValues?.purchasePriceUSD?.toString() ?? '');
  const [supplier, setSupplier] = useState(initialValues?.supplier ?? '');
  const [purchaseDate, setPurchaseDate] = useState(initialValues?.purchaseDate ?? new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [photoUri, setPhotoUri] = useState<string | undefined>(initialValues?.photoUri);
  const [lowStockThreshold, setLowStockThreshold] = useState(initialValues?.lowStockThreshold?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceUSDNum = parseFloat(purchasePriceUSD) || 0;
  const priceVES = exchangeRate ? priceUSDNum * exchangeRate : 0;

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una foto');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar una foto');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handlePickPhoto() {
    Alert.alert('Foto del material', 'Selecciona una opción', [
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Elegir de galería', onPress: pickImage },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) newErrors.quantity = 'La cantidad no puede ser negativa';
    const price = parseFloat(purchasePriceUSD);
    if (isNaN(price) || price < 0) newErrors.purchasePriceUSD = 'El precio no puede ser negativo';
    if (!purchaseDate) newErrors.purchaseDate = 'La fecha de compra es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      quantity: parseFloat(quantity) || 0,
      unit,
      purchasePriceUSD: parseFloat(purchasePriceUSD) || 0,
      supplier: supplier.trim() || undefined,
      purchaseDate,
      notes: notes.trim() || undefined,
      photoUri,
      lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : undefined,
    });
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Input label="Nombre del material" value={name} onChangeText={setName} placeholder="Ej: Tela algodón" error={errors.name} />
        <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción opcional" multiline />

        <Text className="text-sm font-medium text-gray-700 mb-2">Categoría</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}>
              <Text className={`text-sm ${category === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Cantidad" value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="decimal-pad" error={errors.quantity} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Unidad</Text>
            <View className="flex-row flex-wrap gap-1">
              {UNITS.map((u) => (
                <TouchableOpacity key={u} onPress={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-full border ${unit === u ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}>
                  <Text className={`text-xs ${unit === u ? 'text-white' : 'text-gray-700'}`}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Input label="Precio de compra (USD)" value={purchasePriceUSD} onChangeText={setPurchasePriceUSD} placeholder="0.00" keyboardType="decimal-pad" error={errors.purchasePriceUSD} />

        {exchangeRate && (
          <View className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <Text className="text-sm text-gray-600">
              Precio en Bs: <Text className="font-bold text-indigo-700">Bs. {priceVES.toFixed(2)}</Text>
            </Text>
            <Text className="text-xs text-gray-400 mt-1">Tasa: 1 USD = Bs. {exchangeRate.toFixed(2)}</Text>
          </View>
        )}

        <Input label="Proveedor" value={supplier} onChangeText={setSupplier} placeholder="Nombre del proveedor (opcional)" />
        <Input label="Fecha de compra" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" error={errors.purchaseDate} />
        <View className="mb-4 p-3 bg-amber-50 rounded-lg">
          <Input
            label="Alerta de stock bajo (umbral)"
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            placeholder="Ej: 5 — se alerta cuando la cantidad es menor o igual"
            keyboardType="decimal-pad"
          />
          <Text className="text-xs text-amber-700 mt-1">
            Deja vacío para desactivar la alerta de este material.
          </Text>
        </View>
        <Input label="Notas" value={notes} onChangeText={setNotes} placeholder="Notas opcionales" multiline />

        {/* Foto */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Foto del material</Text>
        {photoUri ? (
          <View className="mb-4">
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: 160, borderRadius: 12 }} resizeMode="cover" />
            <TouchableOpacity onPress={() => setPhotoUri(undefined)} className="mt-2">
              <Text className="text-red-500 text-sm text-center">Eliminar foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handlePickPhoto} className="mb-4 border-2 border-dashed border-gray-200 rounded-xl py-6 items-center bg-white">
            <Ionicons name="camera-outline" size={32} color="#9ca3af" />
            <Text className="text-gray-400 text-sm mt-2">Agregar foto</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1"><Button title="Cancelar" onPress={onCancel} variant="ghost" /></View>
          <View className="flex-1"><Button title="Guardar" onPress={handleSubmit} disabled={isSubmitting} /></View>
        </View>
      </View>
    </ScrollView>
  );
}
