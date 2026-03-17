import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GardensPage from './pages/GardensPage'
import GardenDetailPage from './pages/GardenDetailPage'
import CatalogPage from './pages/CatalogPage'
import VegetableDetailPage from './pages/VegetableDetailPage'
import RotationPage from './pages/RotationPage'
import NotificationsPage from './pages/NotificationsPage'
import VegetableAdminPage from './pages/VegetableAdminPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gardens" element={<GardensPage />} />
          <Route path="/gardens/:gardenId" element={<GardenDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:vegetableId" element={<VegetableDetailPage />} />
          <Route path="/rotation" element={<RotationPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/vegetables" element={<VegetableAdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
