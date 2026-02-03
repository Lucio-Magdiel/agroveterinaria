import DashboardController from './DashboardController'
import CategoryController from './CategoryController'
import ProductController from './ProductController'
import SaleController from './SaleController'
import ReportController from './ReportController'
import InventoryMovementController from './InventoryMovementController'
import Settings from './Settings'
const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
CategoryController: Object.assign(CategoryController, CategoryController),
ProductController: Object.assign(ProductController, ProductController),
SaleController: Object.assign(SaleController, SaleController),
ReportController: Object.assign(ReportController, ReportController),
InventoryMovementController: Object.assign(InventoryMovementController, InventoryMovementController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers