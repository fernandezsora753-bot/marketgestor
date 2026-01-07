import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore'

const COLLECTION = 'productos'

/**
 * 🔥 Servicio de Productos para Firebase
 * IMPORTANTE: NO maneja stock (eso será en módulo Inventario)
 */
export const productosService = {
  
  /**
   * Obtener todos los productos
   */
  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error cargando productos:', error)
      throw error
    }
  },

  /**
   * Verificar si un SKU ya existe
   */
  async skuExiste(sku, excludeId = null) {
    try {
      const q = query(collection(db, COLLECTION), where('sku', '==', sku.toUpperCase()))
      const snapshot = await getDocs(q)
      
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId)
      }
      
      return !snapshot.empty
    } catch (error) {
      console.error('Error verificando SKU:', error)
      return false
    }
  },

  /**
   * Crear producto
   */
  async create(productoData) {
    try {
      // Validar SKU único
      const existe = await this.skuExiste(productoData.sku)
      if (existe) {
        throw new Error('El SKU ya existe')
      }

      const producto = {
        nombre: productoData.nombre.trim(),
        descripcion: productoData.descripcion?.trim() || '',
        categoria: productoData.categoria.trim(),
        precio: Number(productoData.precio),
        sku: productoData.sku.toUpperCase().trim(),
        activo: productoData.activo !== undefined ? productoData.activo : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, COLLECTION), producto)
      
      // 🔗 PUNTO DE INTEGRACIÓN CON INVENTARIO
      // Aquí el módulo de Inventario escuchará este evento
      // para crear registro inicial con stock_actual: 0
      
      return docRef.id
    } catch (error) {
      console.error('Error creando producto:', error)
      throw error
    }
  },

  /**
   * Actualizar producto
   */
  async update(id, productoData) {
    try {
      // Validar SKU único si se está cambiando
      if (productoData.sku) {
        const existe = await this.skuExiste(productoData.sku, id)
        if (existe) {
          throw new Error('El SKU ya existe')
        }
      }

      const updateData = {
        ...productoData,
        updatedAt: serverTimestamp()
      }

      if (updateData.sku) {
        updateData.sku = updateData.sku.toUpperCase().trim()
      }
      if (updateData.precio) {
        updateData.precio = Number(updateData.precio)
      }
      if (updateData.nombre) {
        updateData.nombre = updateData.nombre.trim()
      }
      if (updateData.categoria) {
        updateData.categoria = updateData.categoria.trim()
      }

      const docRef = doc(db, COLLECTION, id)
      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error actualizando producto:', error)
      throw error
    }
  },

  /**
   * Eliminar producto (soft delete)
   */
  async delete(id) {
    try {
      // 🔗 PUNTO DE INTEGRACIÓN CON INVENTARIO
      // IMPORTANTE: Verificar si tiene stock antes de eliminar
      // const inventario = await inventarioService.getByProductId(id)
      // if (inventario?.stock_actual > 0) {
      //   throw new Error('No se puede eliminar un producto con stock')
      // }
      
      const docRef = doc(db, COLLECTION, id)
      
      // Soft delete (recomendado)
      await updateDoc(docRef, { 
        activo: false,
        updatedAt: serverTimestamp()
      })
      
      // Hard delete (descomentar si prefieres eliminar permanentemente)
      // await deleteDoc(docRef)
    } catch (error) {
      console.error('Error eliminando producto:', error)
      throw error
    }
  },

  /**
   * Obtener categorías únicas
   */
  async getCategorias() {
    try {
      const productos = await this.getAll()
      const categorias = [...new Set(productos.map(p => p.categoria))]
      return categorias.filter(Boolean).sort()
    } catch (error) {
      console.error('Error obteniendo categorías:', error)
      return []
    }
  }
}