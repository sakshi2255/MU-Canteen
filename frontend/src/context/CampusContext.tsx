import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building, Canteen } from '../models/campus';
import { ServiceProvider } from '../services/serviceProvider';
import { demoStorage } from '../services/demo/demoStorage';

interface CampusContextType {
  buildings: Building[];
  canteens: Canteen[];
  isLoading: boolean;
  searchQuery: string;
  selectedBuildingId: string | null;
  selectedFloor: number | null;
  setSearchQuery: (query: string) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setSelectedFloor: (floor: number | null) => void;
  refreshCampus: () => Promise<void>;
  filteredCanteens: Canteen[];
}

const CampusContext = createContext<CampusContextType>({} as CampusContextType);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, cList] = await Promise.all([
        ServiceProvider.canteens.getBuildings(),
        ServiceProvider.canteens.getCanteens(),
      ]);
      setBuildings(bList);
      setCanteens(cList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = demoStorage.subscribe(() => {
      setBuildings(demoStorage.getBuildings());
      setCanteens(demoStorage.getCanteens());
    });
    return () => unsub();
  }, []);

  const filteredCanteens = canteens.filter((c) => {
    if (!c.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchBldg = c.buildingName.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      if (!matchName && !matchBldg && !matchDesc) return false;
    }
    if (selectedBuildingId && c.buildingId !== selectedBuildingId) return false;
    if (selectedFloor !== null && c.floor !== selectedFloor) return false;
    return true;
  });

  return (
    <CampusContext.Provider
      value={{
        buildings,
        canteens,
        isLoading,
        searchQuery,
        selectedBuildingId,
        selectedFloor,
        setSearchQuery,
        setSelectedBuildingId,
        setSelectedFloor,
        refreshCampus: loadData,
        filteredCanteens,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => useContext(CampusContext);

