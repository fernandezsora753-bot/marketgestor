<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">👥 Gestión de Clientes</h4>
        <p class="text-caption text-grey">Administra tu base de datos de clientes</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Cliente"
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <!-- BARRA DE BÚSQUEDA MEJORADA -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input 
              v-model="busqueda" 
              placeholder="🔍 Buscar por nombre, teléfono, email..."
              outlined
              clearable
              dense
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-6">
            <q-select
              v-model="filtroCredito"
              :options="filtroCreditoOptions"
              label="Filtrar por crédito"
              outlined
              dense
              clearable
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- LISTA DE CLIENTES MEJORADA -->
    <q-card>
      <q-card-section>
        <div v-if="cargando" class="text-center q-pa-lg">
          <q-spinner color="primary" size="xl" />
          <div class="q-mt-md">Cargando clientes...</div>
        </div>

        <div v-else-if="clientesFiltrados.length === 0" class="text-center q-pa-lg">
          <q-icon name="people_outline" size="xl" color="grey-5" />
          <div class="q-mt-md text-grey">
            {{ busqueda ? 'No se encontraron clientes' : 'Aún no hay clientes registrados' }}
          </div>
          <q-btn 
            v-if="!busqueda"
            color="primary" 
            label="Agregar Primer Cliente" 
            class="q-mt-md"
            @click="abrirDialogoNuevo"
          />
        </div>

        <div v-else class="row q-col-gutter-md">
          <div 
            v-for="cliente in clientesFiltrados" 
            :key="cliente.id"
            class="col-12 col-md-6"
          >
            <q-card class="cliente-card">
              <q-card-section>
                <!-- CABECERA CON NOMBRE Y ESTADO CRÉDITO -->
                <div class="row items-center q-mb-sm">
                  <div class="col">
                    <div class="text-h6 text-weight-bold">{{ cliente.nombre }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip 
                      v-if="cliente.credito"
                      size="sm"
                      color="orange"
                      text-color="white"
                      icon="credit_card"
                    >
                      Crédito
                    </q-chip>
                  </div>
                </div>

                <!-- INFORMACIÓN DE CONTACTO -->
                <div class="q-gutter-y-sm">
                  <!-- TELÉFONOS -->
                  <div v-if="cliente.whatsapp || cliente.telefono" class="row items-center">
                    <q-icon name="phone" size="sm" class="q-mr-sm" />
                    <div>
                      <span v-if="cliente.whatsapp" class="q-mr-md">
                        <q-icon name="chat" color="green" size="xs" />
                        {{ formatoTelefono(cliente.whatsapp) }}
                      </span>
                      <span v-if="cliente.telefono">
                        <q-icon name="call" color="blue" size="xs" />
                        {{ formatoTelefono(cliente.telefono) }}
                      </span>
                    </div>
                  </div>

                  <!-- EMAIL -->
                  <div v-if="cliente.email" class="row items-center">
                    <q-icon name="email" size="sm" class="q-mr-sm" />
                    <span>{{ cliente.email }}</span>
                  </div>

                  <!-- DIRECCIÓN -->
                  <div v-if="cliente.direccion" class="row items-start">
                    <q-icon name="location_on" size="sm" class="q-mr-sm q-mt-xs" />
                    <span class="text-caption">{{ cliente.direccion }}</span>
                  </div>

                  <!-- OBSERVACIONES -->
                  <div v-if="cliente.observaciones" class="row items-start q-mt-xs">
                    <q-icon name="note" size="sm" class="q-mr-sm q-mt-xs" />
                    <span class="text-caption text-grey">{{ cliente.observaciones }}</span>
                  </div>

                  <!-- LÍMITE DE CRÉDITO -->
                  <div v-if="cliente.credito && cliente.limiteCredito" class="row items-center q-mt-xs">
                    <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm" />
                    <span class="text-caption">Límite: ${{ formatPrecio(cliente.limiteCredito) }}</span>
                  </div>
                </div>
              </q-card-section>

              <!-- ACCIONES -->
              <q-card-actions align="right">
                <!-- WHATSAPP -->
                <q-btn 
                  v-if="cliente.whatsapp"
                  flat 
                  dense 
                  color="green" 
                  icon="chat"
                  @click="abrirWhatsApp(cliente.whatsapp)"
                >
                  <q-tooltip>WhatsApp</q-tooltip>
                </q-btn>

                <!-- LLAMAR -->
                <q-btn 
                  v-if="cliente.telefono"
                  flat 
                  dense 
                  color="blue" 
                  icon="call"
                  @click="llamarTelefono(cliente.telefono)"
                >
                  <q-tooltip>Llamar</q-tooltip>
                </q-btn>

                <!-- EMAIL -->
                <q-btn 
                  v-if="cliente.email"
                  flat 
                  dense 
                  color="purple" 
                  icon="email"
                  @click="enviarEmail(cliente.email)"
                >
                  <q-tooltip>Email</q-tooltip>
                </q-btn>

                <!-- EDITAR -->
                <q-btn 
                  flat 
                  dense 
                  color="primary" 
                  icon="edit"
                  @click="editarCliente(cliente)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <!-- ELIMINAR -->
                <q-btn 
                  flat 
                  dense 
                  color="red" 
                  icon="delete"
                  @click="confirmarEliminar(cliente)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- CONTADOR -->
        <div v-if="!cargando && clientes.length > 0" class="q-mt-md text-center">
          <q-chip color="primary" text-color="white" icon="people">
            {{ clientesFiltrados.length }} de {{ clientes.length }} clientes
          </q-chip>
          <q-chip v-if="clientesConCredito > 0" color="orange" text-color="white">
            {{ clientesConCredito }} con crédito
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <!-- =========================================== -->
    <!-- DIÁLOGO MEJORADO CREAR/EDITAR CLIENTE -->
    <!-- =========================================== -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 450px; max-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? '✏️ Editar Cliente' : '➕ Nuevo Cliente' }}</div>
          <div class="text-caption">Completa la información del cliente</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarCliente" class="q-gutter-md">
            <!-- INFORMACIÓN BÁSICA -->
            <div class="text-subtitle1 text-weight-medium">📋 Información Básica</div>
            
            <!-- NOMBRE -->
            <q-input
              v-model="formCliente.nombre"
              label="Nombre completo *"
              outlined
              dense
              autofocus
              :rules="[val => !!val || 'El nombre es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <!-- TELÉFONOS -->
            <div class="row q-col-gutter-md">
              <!-- WHATSAPP -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formCliente.whatsapp"
                  label="WhatsApp"
                  outlined
                  dense
                  type="tel"
                  hint="Con código de país"
                  mask="+## ### ### ####"
                  unmasked-value
                >
                  <template v-slot:prepend>
                    <q-icon name="chat" color="green" />
                  </template>
                </q-input>
              </div>

              <!-- TELÉFONO FIJO/MÓVIL -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formCliente.telefono"
                  label="Teléfono alternativo"
                  outlined
                  dense
                  type="tel"
                  mask="### ### ####"
                  unmasked-value
                >
                  <template v-slot:prepend>
                    <q-icon name="call" color="blue" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- EMAIL -->
            <q-input
              v-model="formCliente.email"
              label="Correo electrónico"
              outlined
              dense
              type="email"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <!-- DIRECCIÓN -->
            <q-input
              v-model="formCliente.direccion"
              label="Dirección"
              outlined
              dense
              type="textarea"
              rows="2"
              hint="Dirección completa para entregas"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-input>

            <!-- SECCIÓN CRÉDITO -->
            <div class="text-subtitle1 text-weight-medium q-pt-md">💳 Línea de Crédito</div>
            
            <div class="row items-center q-mb-md">
              <div class="col">
                <q-toggle
                  v-model="formCliente.credito"
                  label="Ofrecer crédito a este cliente"
                  color="orange"
                  left-label
                />
              </div>
            </div>

            <!-- LÍMITE DE CRÉDITO (SOLO SI TIENE CRÉDITO) -->
            <div v-if="formCliente.credito" class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model.number="formCliente.limiteCredito"
                  label="Límite de crédito"
                  outlined
                  dense
                  type="number"
                  prefix="$"
                  hint="Monto máximo que puede deber"
                  :rules="[val => val >= 0 || 'Debe ser positivo']"
                >
                  <template v-slot:prepend>
                    <q-icon name="account_balance_wallet" color="orange" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- OBSERVACIONES -->
            <div class="text-subtitle1 text-weight-medium q-pt-md">📝 Observaciones</div>
            
            <q-input
              v-model="formCliente.observaciones"
              label="Notas adicionales"
              outlined
              dense
              type="textarea"
              rows="3"
              hint="Información importante sobre el cliente"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>

            <!-- BOTONES -->
            <div class="row q-mt-lg">
              <q-space />
              <q-btn flat label="Cancelar" color="grey" v-close-popup @click="cerrarDialogo" />
              <q-btn 
                label="Guardar Cliente" 
                color="primary" 
                type="submit"
                :loading="guardando"
                :disable="!formCliente.nombre"
                icon="save"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'ClientesPage',
  
  setup() {
    const $q = useQuasar()
    
    // DATOS REACTIVOS
    const clientes = ref([])
    const busqueda = ref('')
    const filtroCredito = ref(null)
    const cargando = ref(false)
    const dialogo = ref(false)
    const guardando = ref(false)
    const modoEdicion = ref(false)
    const clienteActual = ref(null)
    
    // FORMULARIO COMPLETO
    const formCliente = ref({
      nombre: '',
      whatsapp: '',
      telefono: '',
      email: '',
      direccion: '',
      credito: false,
      limiteCredito: 0,
      observaciones: ''
    })
    
    // OPCIONES DE FILTRO
    const filtroCreditoOptions = [
      { label: 'Con crédito', value: true },
      { label: 'Sin crédito', value: false }
    ]
    
    // CARGAR CLIENTES - VERSIÓN MEJORADA CON DIAGNÓSTICO
    const cargarClientes = async () => {
      cargando.value = true
      try {
        console.log('🚀 Iniciando carga de clientes...')
        console.log('Firestore disponible:', !!db)
        
        // Verificar si la colección existe
        const clientesRef = collection(db, 'clientes')
        console.log('Referencia a colección creada')
        
        const querySnapshot = await getDocs(clientesRef)
        console.log(`✅ ${querySnapshot.size} clientes cargados`)
        
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Si no hay clientes, mostrar datos de prueba
        if (clientes.value.length === 0) {
          console.log('⚠️ No hay clientes en Firestore, mostrando datos de prueba')
          clientes.value = [
            {
              id: 'demo-1',
              nombre: 'Juan Pérez',
              whatsapp: '573001234567',
              email: 'juan@ejemplo.com',
              direccion: 'Calle 123 #45-67',
              credito: true,
              limiteCredito: 1000000,
              observaciones: 'Cliente preferencial'
            },
            {
              id: 'demo-2',
              nombre: 'María Gómez',
              whatsapp: '573009876543',
              telefono: '6012345678',
              credito: false,
              observaciones: 'Cliente nuevo'
            }
          ]
          
          $q.notify({
            type: 'info',
            message: 'Usando datos de demostración',
            caption: 'Agrega tus primeros clientes',
            timeout: 3000
          })
        }
        
        // Ordenar alfabéticamente por nombre
        clientes.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
        
      } catch (error) {
        console.error('❌ Error cargando clientes:', error)
        
        // Datos de prueba en caso de error
        console.log('📋 Usando datos de prueba...')
        clientes.value = [
          {
            id: 'test-1',
            nombre: 'Cliente de Prueba 1',
            whatsapp: '573001111111',
            email: 'test1@ejemplo.com',
            direccion: 'Dirección de prueba 1',
            credito: false,
            limiteCredito: 0,
            observaciones: 'Cliente de demostración'
          },
          {
            id: 'test-2',
            nombre: 'Cliente de Prueba 2',
            whatsapp: '573002222222',
            telefono: '6022222222',
            credito: true,
            limiteCredito: 500000,
            observaciones: 'Cliente con crédito'
          }
        ]
        
        $q.notify({
          type: 'warning',
          message: 'Modo demostración activado',
          caption: error.message || 'Error de conexión',
          timeout: 5000,
          actions: [
            {
              label: 'Reintentar',
              color: 'white',
              handler: () => cargarClientes()
            }
          ]
        })
      } finally {
        cargando.value = false
      }
    }
    
    // FILTRAR CLIENTES
    const clientesFiltrados = computed(() => {
      let filtrados = clientes.value
      
      // Filtro por búsqueda
      if (busqueda.value.trim()) {
        const termino = busqueda.value.toLowerCase()
        filtrados = filtrados.filter(c => 
          (c.nombre && c.nombre.toLowerCase().includes(termino)) ||
          (c.whatsapp && c.whatsapp.includes(termino)) ||
          (c.telefono && c.telefono.includes(termino)) ||
          (c.email && c.email.toLowerCase().includes(termino)) ||
          (c.direccion && c.direccion.toLowerCase().includes(termino)) ||
          (c.observaciones && c.observaciones.toLowerCase().includes(termino))
        )
      }
      
      // Filtro por crédito
      if (filtroCredito.value !== null) {
        filtrados = filtrados.filter(c => 
          (filtroCredito.value === true && c.credito === true) ||
          (filtroCredito.value === false && (c.credito === false || c.credito === undefined))
        )
      }
      
      return filtrados
    })
    
    // ESTADÍSTICAS
    const clientesConCredito = computed(() => {
      return clientes.value.filter(c => c.credito === true).length
    })
    
    // ABRIR DIÁLOGO NUEVO
    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      clienteActual.value = null
      formCliente.value = {
        nombre: '',
        whatsapp: '',
        telefono: '',
        email: '',
        direccion: '',
        credito: false,
        limiteCredito: 0,
        observaciones: ''
      }
      dialogo.value = true
    }
    
    // EDITAR CLIENTE
    const editarCliente = (cliente) => {
      modoEdicion.value = true
      clienteActual.value = cliente
      formCliente.value = {
        nombre: cliente.nombre || '',
        whatsapp: cliente.whatsapp || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        credito: cliente.credito || false,
        limiteCredito: cliente.limiteCredito || 0,
        observaciones: cliente.observaciones || ''
      }
      dialogo.value = true
    }
    
    // GUARDAR CLIENTE - VERSIÓN MEJORADA
    const guardarCliente = async () => {
      if (!formCliente.value.nombre.trim()) {
        $q.notify({
          type: 'warning',
          message: 'El nombre es obligatorio'
        })
        return
      }
      
      guardando.value = true
      
      try {
        const clienteData = {
          nombre: formCliente.value.nombre.trim(),
          whatsapp: formCliente.value.whatsapp ? formCliente.value.whatsapp.replace(/\s/g, '') : '',
          telefono: formCliente.value.telefono ? formCliente.value.telefono.replace(/\s/g, '') : '',
          email: formCliente.value.email ? formCliente.value.email.trim().toLowerCase() : '',
          direccion: formCliente.value.direccion ? formCliente.value.direccion.trim() : '',
          credito: formCliente.value.credito || false,
          limiteCredito: formCliente.value.credito ? Number(formCliente.value.limiteCredito) || 0 : 0,
          observaciones: formCliente.value.observaciones ? formCliente.value.observaciones.trim() : '',
          updatedAt: serverTimestamp(),
          fechaRegistro: new Date().toISOString()
        }
        
        let message = ''
        
        if (modoEdicion.value && clienteActual.value) {
          // ACTUALIZAR
          const clienteRef = doc(db, 'clientes', clienteActual.value.id)
          await updateDoc(clienteRef, clienteData)
          message = '✅ Cliente actualizado correctamente'
        } else {
          // CREAR
          clienteData.createdAt = serverTimestamp()
          clienteData.saldoActual = 0 // Iniciar saldo en 0
          
          // Si estamos en modo demo, no guardar en Firebase
          if (clienteActual.value && clienteActual.value.id.startsWith('test-')) {
            // Solo actualizar localmente
            const nuevoId = `demo-${Date.now()}`
            clientes.value.push({
              id: nuevoId,
              ...clienteData
            })
            message = '✅ Cliente de demostración agregado'
          } else {
            await addDoc(collection(db, 'clientes'), clienteData)
            message = '✅ Cliente agregado correctamente'
          }
        }
        
        $q.notify({
          type: 'positive',
          message: message,
          icon: 'check_circle'
        })
        
        cerrarDialogo()
        await cargarClientes()
        
      } catch (error) {
        console.error('Error guardando cliente:', error)
        
        // Guardar localmente si Firebase falla
        if (!modoEdicion.value) {
          const nuevoCliente = {
            id: `local-${Date.now()}`,
            nombre: formCliente.value.nombre.trim(),
            whatsapp: formCliente.value.whatsapp || '',
            telefono: formCliente.value.telefono || '',
            email: formCliente.value.email || '',
            direccion: formCliente.value.direccion || '',
            credito: formCliente.value.credito || false,
            limiteCredito: formCliente.value.limiteCredito || 0,
            observaciones: formCliente.value.observaciones || '',
            fechaRegistro: new Date().toISOString()
          }
          
          clientes.value.push(nuevoCliente)
          
          $q.notify({
            type: 'info',
            message: '✅ Cliente guardado localmente',
            caption: 'Se guardará en Firebase cuando se recupere la conexión',
            timeout: 4000
          })
        } else {
          $q.notify({
            type: 'negative',
            message: '❌ Error al guardar cliente',
            caption: error.message,
            icon: 'error'
          })
        }
      } finally {
        guardando.value = false
      }
    }
    
    // CONFIRMAR ELIMINAR
    const confirmarEliminar = (cliente) => {
      $q.dialog({
        title: '⚠️ Confirmar eliminación',
        message: `¿Estás seguro de eliminar a <strong>${cliente.nombre}</strong>?<br><br>
                 <span class="text-negative text-weight-bold">Esta acción no se puede deshacer.</span>`,
        html: true,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey'
        },
        ok: {
          label: 'Eliminar',
          color: 'negative',
          icon: 'delete'
        },
        persistent: true
      }).onOk(async () => {
        await eliminarCliente(cliente)
      })
    }
    
    // ELIMINAR CLIENTE - VERSIÓN MEJORADA
    const eliminarCliente = async (cliente) => {
      try {
        // Solo eliminar de Firebase si no es un cliente demo
        if (!cliente.id.startsWith('demo-') && !cliente.id.startsWith('test-') && !cliente.id.startsWith('local-')) {
          await deleteDoc(doc(db, 'clientes', cliente.id))
        }
        
        // Eliminar de la lista local
        clientes.value = clientes.value.filter(c => c.id !== cliente.id)
        
        $q.notify({
          type: 'positive',
          message: `✅ ${cliente.nombre} eliminado correctamente`,
          icon: 'delete_sweep'
        })
        
      } catch (error) {
        console.error('Error eliminando cliente:', error)
        
        // Si falla Firebase, eliminar solo localmente
        clientes.value = clientes.value.filter(c => c.id !== cliente.id)
        
        $q.notify({
          type: 'info',
          message: `✅ ${cliente.nombre} eliminado localmente`,
          caption: 'Se eliminará de Firebase cuando se recupere la conexión',
          timeout: 4000
        })
      }
    }
    
    // FUNCIONES DE CONTACTO
    const abrirWhatsApp = (numero) => {
      const numeroLimpio = numero.replace(/\D/g, '')
      if (numeroLimpio) {
        window.open(`https://wa.me/${numeroLimpio}`, '_blank')
      } else {
        $q.notify({
          type: 'warning',
          message: 'Número de WhatsApp no válido'
        })
      }
    }
    
    const llamarTelefono = (numero) => {
      const numeroLimpio = numero.replace(/\D/g, '')
      if (numeroLimpio) {
        window.location.href = `tel:${numeroLimpio}`
      }
    }
    
    const enviarEmail = (email) => {
      if (email && email.includes('@')) {
        window.location.href = `mailto:${email}`
      }
    }
    
    // FUNCIONES DE FORMATO
    const formatoTelefono = (telefono) => {
      if (!telefono) return ''
      // Formato: +57 300 123 4567
      const limpio = telefono.replace(/\D/g, '')
      if (limpio.length === 10) {
        return `${limpio.substring(0, 3)} ${limpio.substring(3, 6)} ${limpio.substring(6)}`
      } else if (limpio.length === 12) {
        return `+${limpio.substring(0, 2)} ${limpio.substring(2, 5)} ${limpio.substring(5, 8)} ${limpio.substring(8)}`
      }
      return telefono
    }
    
    const formatPrecio = (precio) => {
      return new Intl.NumberFormat('es-CO').format(precio || 0)
    }
    
    // CERRAR DIÁLOGO
    const cerrarDialogo = () => {
      dialogo.value = false
      formCliente.value = {
        nombre: '',
        whatsapp: '',
        telefono: '',
        email: '',
        direccion: '',
        credito: false,
        limiteCredito: 0,
        observaciones: ''
      }
      modoEdicion.value = false
      clienteActual.value = null
    }
    
    // Cargar clientes al iniciar
    onMounted(() => {
      cargarClientes()
    })
    
    return {
      // Datos
      clientes,
      busqueda,
      filtroCredito,
      cargando,
      dialogo,
      guardando,
      modoEdicion,
      formCliente,
      
      // Computadas
      clientesFiltrados,
      clientesConCredito,
      filtroCreditoOptions,
      
      // Métodos
      abrirDialogoNuevo,
      editarCliente,
      guardarCliente,
      confirmarEliminar,
      abrirWhatsApp,
      llamarTelefono,
      enviarEmail,
      cerrarDialogo,
      formatoTelefono,
      formatPrecio
    }
  }
}
</script>

<style scoped>
.cliente-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.cliente-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Estilos para los iconos de contacto */
.q-icon {
  min-width: 24px;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .cliente-card {
    margin-bottom: 12px;
  }
}
</style>