import React, { useState } from 'react';
import Konten from './Konten';
import AddEdukasi from './AddEdukasi';
import AddKonten from './AddKonten';
import EditEdukasi from './EditEdukasi';
import EditKonten from './EditKonten';
import { useAuth } from '../hooks/useAuth';

const KontenManagement = ({ isSidebarOpen }) => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'add-edukasi', 'add-konten', 'edit-edukasi', 'edit-konten'
    const [selectedKontenId, setSelectedKontenId] = useState(null);
    const [selectedEdukasiId, setSelectedEdukasiId] = useState(null);
    const [selectedKontenType, setSelectedKontenType] = useState(null); // 'edukasi' or 'promosi'
    const [refreshKey, setRefreshKey] = useState(0);
    const { userData } = useAuth();

    const handleAddEdukasi = () => {
        setCurrentView('add-edukasi');
    };

    const handleAddKonten = () => {
        setCurrentView('add-konten');
    };

    const handleEditKonten = (kontenId, type) => {
        setSelectedKontenId(kontenId);
        setSelectedKontenType(type);
        setCurrentView(type === 'edukasi' ? 'edit-edukasi' : 'edit-konten');
    };

    const handleEditEdukasi = (edukasiId, type) => {
        console.log(edukasiId, type)
        setSelectedEdukasiId(edukasiId);
        setSelectedKontenType(type);
        setCurrentView(type === 'edukasi' ? 'edit-edukasi' : 'edit-konten');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedKontenId(null);
        setSelectedEdukasiId(null)
        setSelectedKontenType(null);
    };

    const handleKontenSuccess = () => {
        setCurrentView('list');
        setSelectedKontenId(null);
        setSelectedEdukasiId(null)
        setSelectedKontenType(null);
        // Refresh the konten list
        setRefreshKey(prev => prev + 1);
    };

    const handleKontenDelete = () => {
        setCurrentView('list');
        setSelectedKontenId(null);
        setSelectedEdukasiId(null)
        setSelectedKontenType(null);
        // Refresh the konten list
        setRefreshKey(prev => prev + 1);
    };

    // Render berdasarkan view yang aktif
    if (currentView === 'add-edukasi') {
        return (
            <AddEdukasi
                onBack={handleBackToList}
                onSuccess={handleKontenSuccess}
            />
        );
    }

    if (currentView === 'add-konten') {
        return (
            <AddKonten
                onBack={handleBackToList}
                onSuccess={handleKontenSuccess}
            />
        );
    }
    console.log(currentView, selectedEdukasiId)
    if (currentView === 'edit-edukasi' && selectedEdukasiId) {
        return (
            <EditEdukasi
                edukasiId={selectedEdukasiId}
                onBack={handleBackToList}
                onSuccess={handleKontenSuccess}
                onDelete={handleKontenDelete}
            />
        );
    }

    if (currentView === 'edit-konten' && selectedKontenId) {
        return (
            <EditKonten
                kontenId={selectedKontenId}
                onBack={handleBackToList}
                onSuccess={handleKontenSuccess}
                onDelete={handleKontenDelete}
            />
        );
    }

    // Default view adalah list
    return (
        <Konten
            key={refreshKey}
            isSidebarOpen={isSidebarOpen}
            onAddEdukasi={handleAddEdukasi}
            onAddKonten={handleAddKonten}
            onEditKonten={handleEditKonten}
            onEditEdukasi={handleEditEdukasi}
            isSeller={userData?.seller}
        />
    );
};

export default KontenManagement;