<template>
  <q-page class="q-pa-md">
    <!-- ENCABEZADO -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none">💰 Gestión de Ventas</h4>
        <p class="text-caption text-grey">Registra y administra tus ventas/pedidos</p>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add_shopping_cart" 
          label="Nueva Venta"
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <!-- FILTROS Y BÚSQUEDA -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Búsqueda -->
          <div class="col-12 col-md-6">
            <q-input 
              v-model="busqueda" 
              placeholder="🔍 Buscar por cliente, producto o factura..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Filtro por Estado -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="filtroEstado"
              :options="opcionesEstado"
              label="Filtrar por estado"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>

          <!-- Ordenar -->
          <div class="col-6 col-md-3">
            <q-select
              v-model="ordenar"
              :options="opcionesOrden"
              label="Ordenar por"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ESTADÍSTICAS RÁPIDAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-1">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.total }}</div>
            <div class="text-caption text-grey">Total Ventas</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-orange-1">
          <q-card-section>
            <div class="text-h6">{{ estadisticas.pendientes }}</div>
            <div class="text-caption text-grey">Pendientes</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-1">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(estadisticas.totalVentas) }}</div>
            <div class="text-caption text-grey">Total en Ventas</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple-1">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(estadisticas.totalPagado) }}</div>
            <div class="text-caption text-grey">Total Pagado</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- SALDOS EN CAJA Y TRANSFERENCIAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-green-3">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(saldos.caja) }}</div>
            <div class="text-caption text-grey">💰 Saldo en Caja (Efectivo)</div>
            <div class="text-caption text-grey-7">
              {{ saldos.ventasEfectivo }} ventas en efectivo
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-blue-3">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(saldos.transferencias) }}</div>
            <div class="text-caption text-grey">🏦 Saldo en Transferencias</div>
            <div class="text-caption text-grey-7">
              {{ saldos.ventasTransferencia }} transferencias
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-amber-3">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(saldos.saldoPendiente) }}</div>
            <div class="text-caption text-grey">⏳ Saldo Pendiente Total</div>
            <div class="text-caption text-grey-7">
              {{ saldos.ventasConSaldo }} ventas con saldo
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-teal-3">
          <q-card-section>
            <div class="text-h6">{{ formatearMoneda(saldos.totalPagado) }}</div>
            <div class="text-caption text-grey">✅ Total Pagado (Abonos)</div>
            <div class="text-caption text-grey-7">
              {{ saldos.totalPagos }} pagos registrados
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- LISTA DE VENTAS -->
    <q-card>
      <q-card-section>
        <div v-if="cargando" class="text-center q-pa-lg">
          <q-spinner color="primary" size="xl" />
          <div class="q-mt-md">Cargando ventas...</div>
        </div>

        <div v-else-if="ventasFiltradas.length === 0" class="text-center q-pa-lg">
          <q-icon name="shopping_cart" size="xl" color="grey-5" />
          <div class="q-mt-md text-grey">
            {{ busqueda || filtroEstado ? 'No se encontraron ventas' : 'Aún no hay ventas registradas' }}
          </div>
          <q-btn 
            v-if="!busqueda && !filtroEstado"
            color="primary" 
            label="Registrar Primera Venta" 
            class="q-mt-md"
            @click="abrirDialogoNuevo"
          />
        </div>

        <q-list v-else bordered separator>
          <q-item 
            v-for="venta in ventasFiltradas" 
            :key="venta.id"
            clickable
            v-ripple
            @click="verDetalles(venta)"
          >
            <q-item-section avatar>
              <q-avatar :color="getColorEstado(venta.estado)" text-color="white">
                <q-icon :name="getIconoEstado(venta.estado)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ venta.clienteNombre || venta.nombre || 'Cliente sin nombre' }}
                <span class="text-caption text-grey q-ml-sm">
                  Factura: {{ venta.numeroFactura || 'N/A' }}
                </span>
              </q-item-label>
              <q-item-label caption>
                {{ venta.producto || venta.descripcion }}
              </q-item-label>
              <q-item-label caption>
                📅 {{ formatearFecha(venta.fecha) }}
                <span class="q-ml-md">
                  💳 {{ getFormaPagoLabel(venta.formaPago) }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <div class="text-h6 text-primary">{{ formatearMoneda(venta.precio) }}</div>
                <div v-if="venta.estado !== 'pagado' && venta.estado !== 'cancelado'" 
                     class="text-caption text-orange">
                  Pendiente: {{ formatearMoneda(calcularSaldoPendiente(venta)) }}
                </div>
                <div v-else class="text-caption text-green">
                  Pagado: {{ formatearMoneda(venta.precio) }}
                </div>
                <q-chip 
                  :color="getColorEstado(venta.estado)" 
                  text-color="white" 
                  size="sm"
                  dense
                >
                  {{ venta.estado }}
                </q-chip>
              </div>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn 
                  v-if="venta.estado !== 'pagado' && venta.estado !== 'cancelado'"
                  round 
                  dense 
                  flat 
                  color="positive" 
                  icon="payments"
                  @click.stop="abrirDialogoPago(venta)"
                >
                  <q-tooltip>Registrar Pago</q-tooltip>
                </q-btn>

                <q-btn 
                  round 
                  dense 
                  flat 
                  color="blue" 
                  icon="edit"
                  @click.stop="editarVenta(venta)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn 
                  round 
                  dense 
                  flat 
                  color="red" 
                  icon="delete"
                  @click.stop="confirmarEliminar(venta)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="!cargando && ventas.length > 0" class="q-mt-md text-center text-caption text-grey">
          Mostrando {{ ventasFiltradas.length }} de {{ ventas.length }} ventas
        </div>
      </q-card-section>
    </q-card>

    <!-- DIÁLOGO CREAR/EDITAR VENTA -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">{{ modoEdicion ? 'Editar Venta' : 'Nueva Venta' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="guardarVenta" ref="formVentaRef">
            <!-- NÚMERO DE FACTURA -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12">
                <q-input
                  v-model="formVenta.numeroFactura"
                  label="Número de Factura *"
                  outlined
                  dense
                  readonly
                  :rules="[val => !!val || 'El número de factura es obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="receipt" />
                  </template>
                  <template v-slot:append>
                    <q-btn 
                      round 
                      dense 
                      flat 
                      icon="refresh" 
                      @click="generarNumeroFactura"
                      title="Generar nuevo número"
                    />
                  </template>
                  <template v-slot:hint>
                    Número generado automáticamente
                  </template>
                </q-input>
              </div>
            </div>

            <!-- INFORMACIÓN DEL CLIENTE -->
            <div class="text-subtitle1 text-weight-medium q-mb-md">Información del Cliente</div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.nombre"
                  label="Nombre *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El nombre es obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.cedula"
                  label="Cédula *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La cédula es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
            </div>
            
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.correo"
                  label="Correo Electrónico *"
                  type="email"
                  outlined
                  dense
                  :rules="[val => !!val || 'El correo es obligatorio', val => /.+@.+\..+/.test(val) || 'Correo inválido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.direccion"
                  label="Dirección *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La dirección es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="home" />
                  </template>
                </q-input>
              </div>
            </div>
            
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.telefono1"
                  label="Teléfono 1 *"
                  outlined
                  dense
                  mask="##########"
                  :rules="[val => !!val || 'El teléfono es obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.telefono2"
                  label="Teléfono 2 (opcional)"
                  outlined
                  dense
                  mask="##########"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>
              </div>
            </div>
            
            <!-- INFORMACIÓN DE LA VENTA -->
            <div class="text-subtitle1 text-weight-medium q-mt-lg q-mb-md">Información de la Venta</div>
            
            <!-- Seleccionar Producto -->
            <q-select
              v-model="formVenta.productoId"
              :options="productosOptions"
              label="Seleccionar Producto *"
              outlined
              dense
              emit-value
              map-options
              :loading="cargandoProductos"
              option-value="id"
              option-label="nombre"
              :rules="[val => !!val || 'Debe seleccionar un producto']"
              @update:model-value="actualizarPrecioProducto"
            >
              <template v-slot:prepend>
                <q-icon name="shopping_bag" />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay productos registrados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.producto"
                  label="Descripción del Producto *"
                  outlined
                  dense
                  type="textarea"
                  rows="2"
                  :rules="[val => !!val || 'La descripción es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-input>
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model.number="formVenta.precio"
                  label="Precio *"
                  outlined
                  dense
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="$"
                  :rules="[val => val > 0 || 'El precio debe ser mayor a 0']"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>
            </div>
            
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formVenta.estado"
                  :options="estadosVenta"
                  label="Estado *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[val => !!val || 'El estado es obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="info" />
                  </template>
                </q-select>
              </div>
              
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formVenta.fecha"
                  label="Fecha *"
                  outlined
                  dense
                  type="date"
                  :rules="[val => !!val || 'La fecha es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>
            </div>
            
            <!-- FORMA DE PAGO -->
            <div class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm">Forma de Pago</div>
            
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="formVenta.formaPago"
                  :options="formasPago"
                  label="Forma de Pago *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[val => !!val || 'La forma de pago es obligatoria']"
                  @update:model-value="actualizarCreditoFields"
                >
                  <template v-slot:prepend>
                    <q-icon name="payment" />
                  </template>
                </q-select>
              </div>
            </div>
            
            <!-- SECCIÓN DE CRÉDITO (Solo visible si formaPago es 'credito') -->
            <div v-if="formVenta.formaPago === 'credito'" class="q-mt-md q-pa-md bg-grey-2 rounded-borders">
              <div class="text-subtitle1 text-weight-medium q-mb-sm">Detalles del Crédito</div>
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formVenta.fechaInicioCredito"
                    label="Fecha Inicio Crédito *"
                    outlined
                    dense
                    type="date"
                    :rules="[val => !!val || 'La fecha de inicio es obligatoria']"
                    @update:model-value="calcularFechaFinCredito"
                  >
                    <template v-slot:prepend>
                      <q-icon name="calendar_today" />
                    </template>
                  </q-input>
                </div>
                
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="formVenta.quincenasCredito"
                    label="Número de Quincenas *"
                    outlined
                    dense
                    type="number"
                    min="1"
                    max="48"
                    :rules="[
                      val => !!val || 'Las quincenas son obligatorias',
                      val => val >= 1 || 'Mínimo 1 quincena',
                      val => val <= 48 || 'Máximo 48 quincenas'
                    ]"
                    @update:model-value="calcularFechaFinCredito"
                  >
                    <template v-slot:prepend>
                      <q-icon name="repeat" />
                    </template>
                    <template v-slot:hint>
                      {{ formVenta.quincenasCredito || 0 }} quincenas = {{ (formVenta.quincenasCredito || 0) * 15 }} días
                    </template>
                  </q-input>
                </div>
              </div>
              
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12">
                  <q-input
                    v-model="formVenta.fechaFinCredito"
                    label="Fecha Fin Crédito"
                    outlined
                    dense
                    readonly
                  >
                    <template v-slot:prepend>
                      <q-icon name="event_available" />
                    </template>
                    <template v-slot:hint>
                      Calculada automáticamente
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
            
            <!-- Observaciones -->
            <q-input
              v-model="formVenta.observaciones"
              label="Observaciones (opcional)"
              outlined
              dense
              type="textarea"
              rows="2"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup @click="cerrarDialogo" />
          <q-btn 
            label="Guardar" 
            color="primary" 
            :loading="guardando"
            @click="guardarVenta"
            :disable="!formValido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO REGISTRAR PAGO -->
    <q-dialog v-model="dialogoPago" persistent>
      <q-card style="min-width: 400px; max-width: 500px">
        <q-card-section>
          <div class="text-h6">Registrar Pago</div>
          <div class="text-subtitle2 text-grey">
            {{ ventaPagoActual?.nombre || 'Cliente' }} - {{ formatearMoneda(ventaPagoActual?.precio || 0) }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="registrarPago" ref="formPagoRef">
            <!-- INFORMACIÓN DE SALDO -->
            <div class="q-pa-md bg-grey-2 rounded-borders q-mb-md">
              <div class="row">
                <div class="col">
                  <div class="text-caption text-grey">Total de la venta</div>
                  <div class="text-h6">{{ formatearMoneda(ventaPagoActual?.precio || 0) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey">Pagado anteriormente</div>
                  <div class="text-h6">{{ formatearMoneda(calcularTotalPagado(ventaPagoActual)) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption text-grey">Saldo pendiente</div>
                  <div class="text-h6 text-orange">{{ formatearMoneda(calcularSaldoPendiente(ventaPagoActual)) }}</div>
                </div>
              </div>
            </div>

            <!-- MONTO DEL PAGO -->
            <q-input
              v-model.number="formPago.monto"
              label="Monto a pagar *"
              outlined
              dense
              type="number"
              min="1"
              :max="calcularSaldoPendiente(ventaPagoActual)"
              step="0.01"
              prefix="$"
              :rules="[
                val => !!val || 'El monto es obligatorio',
                val => val > 0 || 'El monto debe ser mayor a 0',
                val => val <= calcularSaldoPendiente(ventaPagoActual) || 'No puede exceder el saldo pendiente'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
              <template v-slot:append>
                <q-btn 
                  flat 
                  dense 
                  label="Pago total" 
                  color="primary"
                  @click="formPago.monto = calcularSaldoPendiente(ventaPagoActual)"
                />
              </template>
            </q-input>

            <!-- MEDIO DE PAGO -->
            <q-select
              v-model="formPago.medioPago"
              :options="mediosPago"
              label="Medio de Pago *"
              outlined
              dense
              class="q-mt-md"
              emit-value
              map-options
              :rules="[val => !!val || 'El medio de pago es obligatorio']"
            >
              <template v-slot:prepend>
                <q-icon name="payment" />
              </template>
            </q-select>

            <!-- FECHA DEL PAGO -->
            <q-input
              v-model="formPago.fecha"
              label="Fecha del Pago *"
              outlined
              dense
              type="date"
              class="q-mt-md"
              :rules="[val => !!val || 'La fecha es obligatoria']"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
            </q-input>

            <!-- OBSERVACIONES -->
            <q-input
              v-model="formPago.observaciones"
              label="Observaciones (opcional)"
              outlined
              dense
              type="textarea"
              rows="2"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="note" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup @click="cerrarDialogoPago" />
          <q-btn 
            label="Registrar Pago" 
            color="positive" 
            :loading="registrandoPago"
            @click="registrarPago"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO DETALLES -->
    <q-dialog v-model="dialogoDetalles" persistent>
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Detalles de la Venta</div>
        </q-card-section>

        <q-card-section v-if="ventaSeleccionada">
          <!-- INFORMACIÓN PRINCIPAL -->
          <div class="q-gutter-sm q-mb-md">
            <div>
              <strong>Factura:</strong> {{ ventaSeleccionada.numeroFactura || 'N/A' }}
            </div>
            <div>
              <strong>Cliente:</strong> {{ ventaSeleccionada.clienteNombre || ventaSeleccionada.nombre }}
            </div>
            <div>
              <strong>Producto:</strong> {{ ventaSeleccionada.producto }}
            </div>
            <div>
              <strong>Precio Total:</strong> {{ formatearMoneda(ventaSeleccionada.precio) }}
            </div>
            <div>
              <strong>Forma de Pago:</strong> {{ getFormaPagoLabel(ventaSeleccionada.formaPago) }}
            </div>
            
            <!-- RESUMEN DE PAGOS -->
            <div class="q-mt-md q-pa-sm bg-grey-2 rounded-borders">
              <div class="row">
                <div class="col">
                  <div class="text-caption">Total Pagado</div>
                  <div class="text-h6 text-positive">{{ formatearMoneda(calcularTotalPagado(ventaSeleccionada)) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption">Saldo Pendiente</div>
                  <div class="text-h6 text-orange">{{ formatearMoneda(calcularSaldoPendiente(ventaSeleccionada)) }}</div>
                </div>
                <div class="col">
                  <div class="text-caption">Porcentaje</div>
                  <div class="text-h6">{{ calcularPorcentajePagado(ventaSeleccionada) }}%</div>
                </div>
              </div>
            </div>
            
            <!-- Mostrar detalles de crédito si aplica -->
            <div v-if="ventaSeleccionada.formaPago === 'credito'">
              <div>
                <strong>Fecha Inicio Crédito:</strong> {{ formatearFecha(ventaSeleccionada.fechaInicioCredito) }}
              </div>
              <div>
                <strong>Quincenas:</strong> {{ ventaSeleccionada.quincenasCredito || 0 }}
              </div>
              <div>
                <strong>Fecha Fin Crédito:</strong> {{ formatearFecha(ventaSeleccionada.fechaFinCredito) }}
              </div>
            </div>
            
            <div>
              <strong>Estado:</strong>
              <q-chip 
                :color="getColorEstado(ventaSeleccionada.estado)" 
                text-color="white" 
                size="sm"
              >
                {{ ventaSeleccionada.estado }}
              </q-chip>
            </div>
            <div>
              <strong>Fecha Venta:</strong> {{ formatearFecha(ventaSeleccionada.fecha) }}
            </div>
            <div v-if="ventaSeleccionada.observaciones">
              <strong>Observaciones:</strong> {{ ventaSeleccionada.observaciones }}
            </div>
          </div>

          <!-- HISTORIAL DE PAGOS -->
          <div v-if="ventaSeleccionada.pagos && ventaSeleccionada.pagos.length > 0">
            <div class="text-subtitle1 text-weight-medium q-mt-lg q-mb-sm">Historial de Pagos</div>
            <q-list bordered separator>
              <q-item v-for="(pago, index) in ventaSeleccionada.pagos" :key="index">
                <q-item-section avatar>
                  <q-avatar :color="getColorMedioPago(pago.medioPago)" text-color="white">
                    <q-icon :name="pago.medioPago === 'efectivo' ? 'money' : 'account_balance'" />
                  </q-avatar>
                </q-item-section>
                
                <q-item-section>
                  <q-item-label>{{ formatearFecha(pago.fecha) }}</q-item-label>
                  <q-item-label caption>
                    {{ pago.medioPago === 'efectivo' ? '💰 Efectivo' : '🏦 Transferencia' }}
                    <span v-if="pago.observaciones"> - {{ pago.observaciones }}</span>
                  </q-item-label>
                </q-item-section>
                
                <q-item-section side>
                  <div class="text-h6 text-positive">{{ formatearMoneda(pago.monto) }}</div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          
          <div v-else class="text-center q-pa-md text-grey">
            <q-icon name="payments" size="xl" />
            <div class="q-mt-sm">No hay pagos registrados</div>
          </div>

          <div class="text-caption text-grey q-mt-md">
            Registrado: {{ formatearFechaCompleta(ventaSeleccionada.createdAt) }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            v-if="ventaSeleccionada?.estado !== 'pagado' && ventaSeleccionada?.estado !== 'cancelado'"
            flat 
            label="Registrar Pago" 
            color="positive"
            @click="abrirDialogoPago(ventaSeleccionada)"
          />
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'VentasPage',
  
  setup() {
    const $q = useQuasar()
    
    // DATOS REACTIVOS
    const ventas = ref([])
    const clientes = ref([])
    const productos = ref([])
    const busqueda = ref('')
    const filtroEstado = ref(null)
    const ordenar = ref('fecha-desc')
    const cargando = ref(false)
    const cargandoClientes = ref(false)
    const cargandoProductos = ref(false)
    const dialogo = ref(false)
    const dialogoDetalles = ref(false)
    const dialogoPago = ref(false)
    const guardando = ref(false)
    const registrandoPago = ref(false)
    const modoEdicion = ref(false)
    const ventaActual = ref(null)
    const ventaPagoActual = ref(null)
    const ventaSeleccionada = ref(null)
    const formVentaRef = ref(null)
    const formPagoRef = ref(null)
    
    // OPCIONES
    const estadosVenta = [
      { label: '⏳ Pendiente', value: 'pendiente' },
      { label: '💵 Pagado', value: 'pagado' },
      { label: '📦 Entregado', value: 'entregado' },
      { label: '❌ Cancelado', value: 'cancelado' }
    ]
    
    const formasPago = [
      { label: '💰 Efectivo', value: 'efectivo' },
      { label: '🏦 Transferencia', value: 'transferencia' },
      { label: '💳 Crédito', value: 'credito' }
    ]
    
    const mediosPago = [
      { label: '💰 Efectivo', value: 'efectivo' },
      { label: '🏦 Transferencia', value: 'transferencia' }
    ]
    
    const opcionesEstado = [
      { label: 'Todos', value: null },
      ...estadosVenta
    ]
    
    const opcionesOrden = [
      { label: 'Fecha (más reciente)', value: 'fecha-desc' },
      { label: 'Fecha (más antiguo)', value: 'fecha-asc' },
      { label: 'Precio (mayor)', value: 'precio-desc' },
      { label: 'Precio (menor)', value: 'precio-asc' },
      { label: 'Cliente (A-Z)', value: 'cliente-asc' }
    ]
    
    const formVenta = ref({
      // Información del cliente
      nombre: '',
      cedula: '',
      direccion: '',
      correo: '',
      telefono1: '',
      telefono2: '',
      
      // Información de la venta
      numeroFactura: '',
      productoId: null,
      producto: '',
      precio: 0,
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
      formaPago: 'efectivo',
      
      // Campos para crédito
      fechaInicioCredito: '',
      quincenasCredito: 1,
      fechaFinCredito: '',
      
      observaciones: ''
    })
    
    const formPago = ref({
      monto: 0,
      medioPago: 'efectivo',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    })
    
    // FUNCIÓN PARA GENERAR NÚMERO DE FACTURA
    const generarNumeroFactura = () => {
      const hoy = new Date()
      const fecha = hoy.toISOString().slice(0,10).replace(/-/g, '')
      
      // Obtener consecutivo desde localStorage
      let consecutivo = localStorage.getItem('facturaConsecutivo')
      if (!consecutivo || consecutivo.slice(0,8) !== fecha.slice(0,8)) {
        consecutivo = 1
      } else {
        consecutivo = parseInt(localStorage.getItem('facturaConsecutivo')) + 1
      }
      
      // Guardar nuevo consecutivo
      localStorage.setItem('facturaConsecutivo', consecutivo)
      
      // Formatear número con ceros a la izquierda
      const consecutivoFormateado = consecutivo.toString().padStart(3, '0')
      formVenta.value.numeroFactura = `FAC-${fecha}-${consecutivoFormateado}`
    }
    
    // FUNCIÓN PARA CALCULAR FECHA FIN DE CRÉDITO
    const calcularFechaFinCredito = () => {
      if (formVenta.value.fechaInicioCredito && formVenta.value.quincenasCredito) {
        const fechaInicio = new Date(formVenta.value.fechaInicioCredito)
        const dias = formVenta.value.quincenasCredito * 15 // 15 días por quincena
        const fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + dias)
        
        formVenta.value.fechaFinCredito = fechaFin.toISOString().split('T')[0]
      }
    }
    
    // ACTUALIZAR CAMPOS DE CRÉDITO AL CAMBIAR FORMA DE PAGO
    const actualizarCreditoFields = () => {
      if (formVenta.value.formaPago === 'credito') {
        // Establecer valores por defecto para crédito
        if (!formVenta.value.fechaInicioCredito) {
          formVenta.value.fechaInicioCredito = new Date().toISOString().split('T')[0]
        }
        if (!formVenta.value.quincenasCredito || formVenta.value.quincenasCredito < 1) {
          formVenta.value.quincenasCredito = 1
        }
        calcularFechaFinCredito()
      }
    }
    
    // OBTENER ETIQUETA DE FORMA DE PAGO
    const getFormaPagoLabel = (valor) => {
      const formaPago = formasPago.find(fp => fp.value === valor)
      return formaPago ? formaPago.label : 'No especificado'
    }
    
    // COLOR PARA MEDIO DE PAGO
    const getColorMedioPago = (medioPago) => {
      return medioPago === 'efectivo' ? 'green' : 'blue'
    }
    
    // CARGAR PRODUCTOS
    const cargarProductos = async () => {
      cargandoProductos.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'productos'))
        productos.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando productos:', error)
      } finally {
        cargandoProductos.value = false
      }
    }
    
    // OPCIONES DE PRODUCTOS PARA SELECT
    const productosOptions = computed(() => {
      return productos.value.map(p => ({
        id: p.id,
        nombre: p.nombre || p.descripcion || 'Producto sin nombre',
        precio: p.precio || 0
      }))
    })
    
    // ACTUALIZAR PRECIO AL SELECCIONAR PRODUCTO
    const actualizarPrecioProducto = (productoId) => {
      if (productoId) {
        const productoSeleccionado = productos.value.find(p => p.id === productoId)
        if (productoSeleccionado) {
          formVenta.value.producto = productoSeleccionado.nombre || productoSeleccionado.descripcion
          formVenta.value.precio = productoSeleccionado.precio || 0
        }
      }
    }
    
    // CARGAR CLIENTES
    const cargarClientes = async () => {
      cargandoClientes.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'clientes'))
        clientes.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error cargando clientes:', error)
      } finally {
        cargandoClientes.value = false
      }
    }
    
    // CARGAR VENTAS
    const cargarVentas = async () => {
      cargando.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'ventas'))
        ventas.value = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            // Asegurar que pagos sea un array
            pagos: Array.isArray(data.pagos) ? data.pagos : [],
            ...data
          }
        })
      } catch (error) {
        console.error('Error cargando ventas:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar ventas',
          caption: error.message
        })
      } finally {
        cargando.value = false
      }
    }
    
    // CALCULAR TOTAL PAGADO DE UNA VENTA
    const calcularTotalPagado = (venta) => {
      if (!venta || !venta.pagos || !Array.isArray(venta.pagos)) return 0
      return venta.pagos.reduce((total, pago) => total + (pago.monto || 0), 0)
    }
    
    // CALCULAR SALDO PENDIENTE DE UNA VENTA
    const calcularSaldoPendiente = (venta) => {
      if (!venta) return 0
      const totalPagado = calcularTotalPagado(venta)
      return Math.max(0, (venta.precio || 0) - totalPagado)
    }
    
    // CALCULAR PORCENTAJE PAGADO
    const calcularPorcentajePagado = (venta) => {
      if (!venta || !venta.precio || venta.precio <= 0) return 0
      const totalPagado = calcularTotalPagado(venta)
      return Math.round((totalPagado / venta.precio) * 100)
    }
    
    // SALDOS EN TIEMPO REAL
    const saldos = computed(() => {
      let caja = 0
      let transferencias = 0
      let saldoPendiente = 0
      let totalPagado = 0
      let ventasEfectivo = 0
      let ventasTransferencia = 0
      let ventasConSaldo = 0
      let totalPagos = 0
      
      ventas.value.forEach(venta => {
        // Contar ventas por forma de pago
        if (venta.formaPago === 'efectivo') {
          ventasEfectivo++
        } else if (venta.formaPago === 'transferencia') {
          ventasTransferencia++
        }
        
        // Sumar pagos registrados
        if (venta.pagos && Array.isArray(venta.pagos)) {
          venta.pagos.forEach(pago => {
            if (pago.medioPago === 'efectivo') {
              caja += pago.monto || 0
            } else if (pago.medioPago === 'transferencia') {
              transferencias += pago.monto || 0
            }
            totalPagado += pago.monto || 0
            totalPagos++
          })
        }
        
        // Calcular saldos pendientes
        const pendiente = calcularSaldoPendiente(venta)
        if (pendiente > 0) {
          saldoPendiente += pendiente
          ventasConSaldo++
        }
      })
      
      return {
        caja,
        transferencias,
        saldoPendiente,
        totalPagado,
        ventasEfectivo,
        ventasTransferencia,
        ventasConSaldo,
        totalPagos
      }
    })
    
    // FILTRAR Y ORDENAR VENTAS
    const ventasFiltradas = computed(() => {
      let resultado = [...ventas.value]
      
      // Filtrar por búsqueda
      if (busqueda.value.trim()) {
        const termino = busqueda.value.toLowerCase()
        resultado = resultado.filter(v => 
          (v.nombre && v.nombre.toLowerCase().includes(termino)) ||
          (v.producto && v.producto.toLowerCase().includes(termino)) ||
          (v.numeroFactura && v.numeroFactura.toLowerCase().includes(termino))
        )
      }
      
      // Filtrar por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(v => v.estado === filtroEstado.value)
      }
      
      // Ordenar
      switch (ordenar.value) {
        case 'fecha-desc':
          resultado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          break
        case 'fecha-asc':
          resultado.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          break
        case 'precio-desc':
          resultado.sort((a, b) => b.precio - a.precio)
          break
        case 'precio-asc':
          resultado.sort((a, b) => a.precio - b.precio)
          break
        case 'cliente-asc':
          resultado.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
          break
      }
      
      return resultado
    })
    
    // ESTADÍSTICAS
    const estadisticas = computed(() => {
      return {
        total: ventas.value.length,
        pendientes: ventas.value.filter(v => v.estado === 'pendiente').length,
        totalVentas: ventas.value.reduce((sum, v) => sum + (v.precio || 0), 0),
        totalPagado: ventas.value
          .filter(v => v.estado === 'pagado' || v.estado === 'entregado')
          .reduce((sum, v) => sum + (v.precio || 0), 0)
      }
    })
    
    // VALIDACIÓN DEL FORMULARIO
    const formValido = computed(() => {
      const valido = formVenta.value.nombre && 
             formVenta.value.cedula && 
             formVenta.value.correo &&
             formVenta.value.direccion &&
             formVenta.value.telefono1 &&
             formVenta.value.numeroFactura &&
             formVenta.value.productoId &&
             formVenta.value.producto && 
             formVenta.value.precio > 0 &&
             formVenta.value.estado &&
             formVenta.value.fecha &&
             formVenta.value.formaPago
      
      // Validación adicional para crédito
      if (formVenta.value.formaPago === 'credito') {
        return valido && 
               formVenta.value.fechaInicioCredito &&
               formVenta.value.quincenasCredito >= 1
      }
      
      return valido
    })
    
    // FORMATEAR MONEDA
    const formatearMoneda = (valor) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor || 0)
    }
    
    // FORMATEAR FECHA
    const formatearFecha = (fecha) => {
      if (!fecha) return 'Sin fecha'
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // FORMATEAR FECHA COMPLETA
    const formatearFechaCompleta = (timestamp) => {
      if (!timestamp) return 'Sin fecha'
      const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return fecha.toLocaleString('es-CO')
    }
    
    // COLOR SEGÚN ESTADO
    const getColorEstado = (estado) => {
      const colores = {
        pendiente: 'orange',
        pagado: 'green',
        entregado: 'blue',
        cancelado: 'red'
      }
      return colores[estado] || 'grey'
    }
    
    // ICONO SEGÚN ESTADO
    const getIconoEstado = (estado) => {
      const iconos = {
        pendiente: 'schedule',
        pagado: 'paid',
        entregado: 'local_shipping',
        cancelado: 'cancel'
      }
      return iconos[estado] || 'help'
    }
    
    // ABRIR DIÁLOGO NUEVO
    const abrirDialogoNuevo = () => {
      modoEdicion.value = false
      ventaActual.value = null
      generarNumeroFactura() // Generar número automáticamente
      formVenta.value = {
        nombre: '',
        cedula: '',
        direccion: '',
        correo: '',
        telefono1: '',
        telefono2: '',
        numeroFactura: formVenta.value.numeroFactura, // Mantener el número generado
        productoId: null,
        producto: '',
        precio: 0,
        estado: 'pendiente',
        fecha: new Date().toISOString().split('T')[0],
        formaPago: 'efectivo',
        fechaInicioCredito: '',
        quincenasCredito: 1,
        fechaFinCredito: '',
        observaciones: ''
      }
      dialogo.value = true
    }
    
    // EDITAR VENTA
    const editarVenta = (venta) => {
      modoEdicion.value = true
      ventaActual.value = venta
      formVenta.value = {
        nombre: venta.nombre,
        cedula: venta.cedula,
        direccion: venta.direccion,
        correo: venta.correo,
        telefono1: venta.telefono1,
        telefono2: venta.telefono2 || '',
        numeroFactura: venta.numeroFactura || '',
        productoId: venta.productoId,
        producto: venta.producto,
        precio: venta.precio,
        estado: venta.estado,
        fecha: venta.fecha,
        formaPago: venta.formaPago || 'efectivo',
        fechaInicioCredito: venta.fechaInicioCredito || '',
        quincenasCredito: venta.quincenasCredito || 1,
        fechaFinCredito: venta.fechaFinCredito || '',
        observaciones: venta.observaciones || ''
      }
      dialogo.value = true
    }
    
    // ABRIR DIÁLOGO PARA REGISTRAR PAGO
    const abrirDialogoPago = (venta) => {
      ventaPagoActual.value = venta
      const saldoPendiente = calcularSaldoPendiente(venta)
      
      formPago.value = {
        monto: saldoPendiente, // Por defecto pago total
        medioPago: 'efectivo',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      }
      
      dialogoPago.value = true
    }
    
    // REGISTRAR PAGO
    const registrarPago = async () => {
      // Validar formulario
      if (formPagoRef.value) {
        const isValid = await formPagoRef.value.validate()
        if (!isValid) {
          $q.notify({
            type: 'warning',
            message: 'Por favor completa todos los campos obligatorios'
          })
          return
        }
      }
      
      registrandoPago.value = true
      
      try {
        const venta = ventaPagoActual.value
        const nuevoPago = {
          monto: Number(formPago.value.monto),
          medioPago: formPago.value.medioPago,
          fecha: formPago.value.fecha,
          observaciones: formPago.value.observaciones.trim(),
          createdAt: serverTimestamp()
        }
        
        // Obtener pagos actuales
        const pagosActuales = venta.pagos && Array.isArray(venta.pagos) ? [...venta.pagos] : []
        pagosActuales.push(nuevoPago)
        
        // Calcular nuevo saldo
        const totalPagado = pagosActuales.reduce((sum, p) => sum + (p.monto || 0), 0)
        const saldoPendiente = Math.max(0, venta.precio - totalPagado)
        
        // Actualizar estado si está completamente pagado
        const nuevoEstado = saldoPendiente <= 0 ? 'pagado' : venta.estado
        
        // Actualizar venta en Firestore
        const ventaRef = doc(db, 'ventas', venta.id)
        await updateDoc(ventaRef, {
          pagos: pagosActuales,
          estado: nuevoEstado,
          updatedAt: serverTimestamp()
        })
        
        $q.notify({
          type: 'positive',
          message: `✅ Pago registrado correctamente - ${formatearMoneda(nuevoPago.monto)}`,
          caption: nuevoEstado === 'pagado' ? '¡Venta completamente pagada!' : `Saldo pendiente: ${formatearMoneda(saldoPendiente)}`
        })
        
        cerrarDialogoPago()
        await cargarVentas()
        
      } catch (error) {
        console.error('Error registrando pago:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al registrar pago',
          caption: error.message
        })
      } finally {
        registrandoPago.value = false
      }
    }
    
    // VER DETALLES
    const verDetalles = (venta) => {
      ventaSeleccionada.value = venta
      dialogoDetalles.value = true
    }
    
    // GUARDAR VENTA
    const guardarVenta = async () => {
      // Validar formulario
      if (formVentaRef.value) {
        const isValid = await formVentaRef.value.validate()
        if (!isValid) {
          $q.notify({
            type: 'warning',
            message: 'Por favor completa todos los campos obligatorios'
          })
          return
        }
      }
      
      guardando.value = true
      
      try {
        const ventaData = {
          // Información del cliente
          nombre: formVenta.value.nombre.trim(),
          cedula: formVenta.value.cedula.trim(),
          direccion: formVenta.value.direccion.trim(),
          correo: formVenta.value.correo.trim(),
          telefono1: formVenta.value.telefono1.trim(),
          telefono2: formVenta.value.telefono2?.trim() || '',
          
          // Información de la venta
          numeroFactura: formVenta.value.numeroFactura,
          productoId: formVenta.value.productoId,
          producto: formVenta.value.producto.trim(),
          precio: Number(formVenta.value.precio),
          estado: formVenta.value.estado,
          fecha: formVenta.value.fecha,
          formaPago: formVenta.value.formaPago,
          
          // Información de crédito (si aplica)
          fechaInicioCredito: formVenta.value.formaPago === 'credito' ? formVenta.value.fechaInicioCredito : '',
          quincenasCredito: formVenta.value.formaPago === 'credito' ? Number(formVenta.value.quincenasCredito) : 0,
          fechaFinCredito: formVenta.value.formaPago === 'credito' ? formVenta.value.fechaFinCredito : '',
          
          // Inicializar pagos como array vacío
          pagos: [],
          
          observaciones: formVenta.value.observaciones.trim(),
          updatedAt: serverTimestamp()
        }
        
        if (modoEdicion.value && ventaActual.value) {
          // ACTUALIZAR
          const ventaRef = doc(db, 'ventas', ventaActual.value.id)
          await updateDoc(ventaRef, ventaData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Venta actualizada correctamente'
          })
        } else {
          // CREAR
          ventaData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'ventas'), ventaData)
          
          $q.notify({
            type: 'positive',
            message: '✅ Venta registrada correctamente'
          })
        }
        
        cerrarDialogo()
        await cargarVentas()
        
      } catch (error) {
        console.error('Error guardando venta:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al guardar venta',
          caption: error.message
        })
      } finally {
        guardando.value = false
      }
    }
    
    // CONFIRMAR ELIMINAR
    const confirmarEliminar = (venta) => {
      $q.dialog({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar esta venta de ${venta.nombre}?`,
        cancel: {
          label: 'Cancelar',
          flat: true,
          color: 'grey'
        },
        ok: {
          label: 'Eliminar',
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        await eliminarVenta(venta)
      })
    }
    
    // ELIMINAR VENTA
    const eliminarVenta = async (venta) => {
      try {
        await deleteDoc(doc(db, 'ventas', venta.id))
        
        $q.notify({
          type: 'positive',
          message: '✅ Venta eliminada correctamente'
        })
        
        await cargarVentas()
      } catch (error) {
        console.error('Error eliminando venta:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al eliminar venta',
          caption: error.message
        })
      }
    }
    
    // CERRAR DIÁLOGO VENTA
    const cerrarDialogo = () => {
      dialogo.value = false
      formVenta.value = {
        nombre: '',
        cedula: '',
        direccion: '',
        correo: '',
        telefono1: '',
        telefono2: '',
        numeroFactura: '',
        productoId: null,
        producto: '',
        precio: 0,
        estado: 'pendiente',
        fecha: new Date().toISOString().split('T')[0],
        formaPago: 'efectivo',
        fechaInicioCredito: '',
        quincenasCredito: 1,
        fechaFinCredito: '',
        observaciones: ''
      }
      modoEdicion.value = false
      ventaActual.value = null
    }
    
    // CERRAR DIÁLOGO PAGO
    const cerrarDialogoPago = () => {
      dialogoPago.value = false
      formPago.value = {
        monto: 0,
        medioPago: 'efectivo',
        fecha: new Date().toISOString().split('T')[0],
        observaciones: ''
      }
      ventaPagoActual.value = null
    }
    
    // INICIALIZAR
    onMounted(async () => {
      await cargarClientes()
      await cargarProductos()
      await cargarVentas()
    })
    
    return {
      ventas,
      busqueda,
      filtroEstado,
      ordenar,
      cargando,
      cargandoClientes,
      cargandoProductos,
      dialogo,
      dialogoDetalles,
      dialogoPago,
      guardando,
      registrandoPago,
      modoEdicion,
      formVenta,
      formPago,
      ventaPagoActual,
      ventaSeleccionada,
      ventasFiltradas,
      estadisticas,
      saldos,
      formValido,
      estadosVenta,
      formasPago,
      mediosPago,
      opcionesEstado,
      opcionesOrden,
      productosOptions,
      formVentaRef,
      formPagoRef,
      formatearMoneda,
      formatearFecha,
      formatearFechaCompleta,
      getColorEstado,
      getIconoEstado,
      getFormaPagoLabel,
      getColorMedioPago,
      calcularTotalPagado,
      calcularSaldoPendiente,
      calcularPorcentajePagado,
      actualizarPrecioProducto,
      generarNumeroFactura,
      calcularFechaFinCredito,
      actualizarCreditoFields,
      abrirDialogoNuevo,
      editarVenta,
      abrirDialogoPago,
      registrarPago,
      verDetalles,
      guardarVenta,
      confirmarEliminar,
      cerrarDialogo,
      cerrarDialogoPago
    }
  }
}
</script>

<style scoped>
.q-item {
  border-radius: 8px;
  margin-bottom: 4px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Estilo para resaltar ventas con saldo pendiente */
.saldo-pendiente {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
</style>