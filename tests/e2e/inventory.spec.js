/**
 * Pruebas End-to-End con Playwright
 * Simulan interacciones reales de usuario en el navegador
 */

const { test, expect } = require('@playwright/test');

test.describe('Sistema de Inventario Médico - E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación antes de cada prueba
    await page.goto('http://localhost:3000');
  });

  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar título
    await expect(page).toHaveTitle(/Gestión de Inventarios Médicos/);
    
    // Verificar elementos principales
    await expect(page.locator('h1')).toContainText('Sistema de Gestión de Inventarios Médicos');
    await expect(page.locator('h2').first()).toContainText('Agregar Nuevo Insumo');
  });

  test('debe crear un nuevo insumo médico desde la interfaz', async ({ page }) => {
    // Llenar el formulario
    await page.fill('#name', 'Jeringas 5ml E2E');
    await page.fill('#stock', '150');
    await page.selectOption('#category', 'Material de Curación');
    await page.fill('#description', 'Prueba E2E automatizada');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Esperar a que aparezca el alert de éxito
    await page.waitForSelector('.alert-success', { state: 'visible' });
    
    // Verificar mensaje de éxito
    const alertText = await page.locator('.alert-success').textContent();
    expect(alertText).toContain('Insumo creado exitosamente');

    // Verificar que el item aparece en la lista
    await page.waitForSelector('.item-card');
    const itemName = await page.locator('.item-name').first().textContent();
    expect(itemName).toBe('Jeringas 5ml E2E');
  });

  test('debe validar campos obligatorios', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');

    // El navegador debe mostrar validación HTML5
    const nameInput = page.locator('#name');
    const isInvalid = await nameInput.evaluate((el) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('debe rechazar stock negativo desde la interfaz', async ({ page }) => {
    // Llenar formulario con stock negativo
    await page.fill('#name', 'Producto Inválido');
    await page.fill('#stock', '-5');
    await page.selectOption('#category', 'Medicamentos');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Esperar mensaje de error
    await page.waitForSelector('.alert-error', { state: 'visible', timeout: 5000 });
    
    const alertText = await page.locator('.alert-error').textContent();
    expect(alertText).toContain('no negativo');
  });

  test('debe mostrar el estado correcto del stock (ALTO)', async ({ page }) => {
    // Crear item con stock ALTO
    await page.fill('#name', 'Stock ALTO E2E');
    await page.fill('#stock', '100');
    await page.selectOption('#category', 'Equipo Médico');
    await page.click('button[type="submit"]');

    // Esperar y verificar badge de stock
    await page.waitForSelector('.stock-badge');
    const stockBadge = page.locator('.stock-badge').first();
    await expect(stockBadge).toContainText('ALTO');
    await expect(stockBadge).toHaveClass(/stock-ALTO/);
  });

  test('debe mostrar el estado CRÍTICO cuando stock es 0', async ({ page }) => {
    // Crear item con stock CRÍTICO
    await page.fill('#name', 'Stock CRÍTICO E2E');
    await page.fill('#stock', '0');
    await page.selectOption('#category', 'Protección Personal');
    await page.click('button[type="submit"]');

    // Verificar badge CRÍTICO
    await page.waitForSelector('.stock-CRÍTICO');
    const stockBadge = page.locator('.stock-CRÍTICO').first();
    await expect(stockBadge).toContainText('CRÍTICO');
  });

  test('debe eliminar un insumo correctamente', async ({ page }) => {
    // Primero crear un item
    await page.fill('#name', 'Item para Eliminar');
    await page.fill('#stock', '50');
    await page.selectOption('#category', 'Material de Curación');
    await page.click('button[type="submit"]');

    // Esperar a que aparezca
    await page.waitForSelector('.item-card');

    // Contar items antes de eliminar
    const itemsBeforeCount = await page.locator('.item-card').count();

    // Configurar el diálogo de confirmación
    page.on('dialog', dialog => dialog.accept());

    // Click en eliminar
    await page.click('.btn-delete >> nth=0');

    // Esperar a que desaparezca
    await page.waitForTimeout(1000);

    // Verificar que se eliminó
    const itemsAfterCount = await page.locator('.item-card').count();
    expect(itemsAfterCount).toBe(itemsBeforeCount - 1);
  });

  test('debe actualizar el stock de un insumo', async ({ page }) => {
    // Crear item
    await page.fill('#name', 'Item para Actualizar');
    await page.fill('#stock', '30');
    await page.selectOption('#category', 'Medicamentos');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.item-card');

    // Configurar el prompt para actualizar
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('nuevo stock');
      dialog.accept('200');
    });

    // Click en editar
    await page.click('.btn-update >> nth=0');

    // Esperar actualización
    await page.waitForTimeout(1500);

    // Verificar nuevo estado
    const stockBadge = page.locator('.stock-badge').first();
    await expect(stockBadge).toContainText('200');
    await expect(stockBadge).toContainText('ALTO');
  });

  test('flujo completo de usuario: crear y eliminar insumo', async ({ page }) => {
    // 1. CREAR
    await page.fill('#name', 'Flujo Completo E2E');
    await page.fill('#stock', '75');
    await page.selectOption('#category', 'Instrumental');
    await page.fill('#description', 'Prueba de flujo completo');
    await page.click('button[type="submit"]');

    // 2. VERIFICAR CREACIÓN
    await page.waitForSelector('.alert-success');
    await expect(page.locator('.item-name').first()).toContainText('Flujo Completo E2E');

    // 3. ELIMINAR
    page.on('dialog', dialog => dialog.accept());
    await page.click('.btn-delete >> nth=0');

    // 4. VERIFICAR ELIMINACIÓN
    await page.waitForTimeout(1000);
    await page.waitForSelector('.alert-success');
    const alertText = await page.locator('.alert-success').textContent();
    expect(alertText).toContain('eliminado exitosamente');
  });

  test('debe mostrar mensaje cuando no hay insumos', async ({ page }) => {
    // Verificar mensaje de lista vacía (si aplica)
    const emptyState = page.locator('.empty-state');
    
    // Si existe el mensaje de vacío, verificarlo
    const count = await page.locator('.item-card').count();
    if (count === 0) {
      await expect(emptyState).toContainText('No hay insumos registrados');
    }
  });

  test('debe validar que el formulario se limpia después de crear', async ({ page }) => {
    // Llenar formulario
    await page.fill('#name', 'Test Limpieza');
    await page.fill('#stock', '50');
    await page.selectOption('#category', 'Protección Personal');
    
    // Enviar
    await page.click('button[type="submit"]');
    await page.waitForSelector('.alert-success');

    // Verificar que los campos se limpiaron
    const nameValue = await page.inputValue('#name');
    const stockValue = await page.inputValue('#stock');
    
    expect(nameValue).toBe('');
    expect(stockValue).toBe('');
  });
});