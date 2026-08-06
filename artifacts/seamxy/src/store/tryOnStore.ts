import { create } from "zustand";

export interface BodyLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface ClothingLayer {
  productId: string;
  imageUrl: string;
  category: string;
  name: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface TryOnState {
  userPhotoUrl: string | null;
  bodyLandmarks: BodyLandmark[] | null;
  isProcessingPhoto: boolean;
  clothingLayers: ClothingLayer[];
  resultImageUrl: string | null;
  currentSessionId: string | null;
  selectedModelId: string | null;
  warpEnabled: boolean;
  warpStrength: number;
  shadowOpacity: number;
  brightness: number;

  setUserPhoto: (url: string, landmarks: BodyLandmark[]) => void;
  clearUserPhoto: () => void;
  setProcessingPhoto: (value: boolean) => void;
  addClothingLayer: (layer: ClothingLayer) => void;
  removeClothingLayer: (productId: string) => void;
  updateLayerPosition: (productId: string, position: { x: number; y: number }) => void;
  updateLayerScale: (productId: string, scale: number) => void;
  updateLayerRotation: (productId: string, rotation: number) => void;
  reorderLayers: (layers: ClothingLayer[]) => void;
  clearLayers: () => void;
  setResultImage: (url: string, sessionId: string) => void;
  clearResult: () => void;
  setSelectedModel: (modelId: string | null) => void;
  setWarpEnabled: (value: boolean) => void;
  setWarpStrength: (value: number) => void;
  setShadowOpacity: (value: number) => void;
  setBrightness: (value: number) => void;
  resetStudio: () => void;
}

export const useTryOnStore = create<TryOnState>((set) => ({
  userPhotoUrl: null,
  bodyLandmarks: null,
  isProcessingPhoto: false,
  clothingLayers: [],
  resultImageUrl: null,
  currentSessionId: null,
  selectedModelId: null,
  warpEnabled: false,
  warpStrength: 50,
  shadowOpacity: 0.3,
  brightness: 1.0,

  setUserPhoto: (url, landmarks) =>
    set({ userPhotoUrl: url, bodyLandmarks: landmarks, isProcessingPhoto: false }),
  clearUserPhoto: () =>
    set({ userPhotoUrl: null, bodyLandmarks: null }),
  setProcessingPhoto: (value) =>
    set({ isProcessingPhoto: value }),
  addClothingLayer: (layer) =>
    set((state) => ({
      clothingLayers: [
        ...state.clothingLayers.filter((l) => l.productId !== layer.productId),
        layer,
      ],
    })),
  removeClothingLayer: (productId) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.filter((l) => l.productId !== productId),
    })),
  updateLayerPosition: (productId, position) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, position } : l
      ),
    })),
  updateLayerScale: (productId, scale) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, scale } : l
      ),
    })),
  updateLayerRotation: (productId, rotation) =>
    set((state) => ({
      clothingLayers: state.clothingLayers.map((l) =>
        l.productId === productId ? { ...l, rotation } : l
      ),
    })),
  reorderLayers: (layers) => set({ clothingLayers: layers }),
  clearLayers: () => set({ clothingLayers: [] }),
  setResultImage: (url, sessionId) =>
    set({ resultImageUrl: url, currentSessionId: sessionId }),
  clearResult: () =>
    set({ resultImageUrl: null, currentSessionId: null }),
  setSelectedModel: (modelId) =>
    set({ selectedModelId: modelId }),
  setWarpEnabled: (value) => set({ warpEnabled: value }),
  setWarpStrength: (value) => set({ warpStrength: value }),
  setShadowOpacity: (value) => set({ shadowOpacity: value }),
  setBrightness: (value) => set({ brightness: value }),
  resetStudio: () =>
    set({
      userPhotoUrl: null,
      bodyLandmarks: null,
      clothingLayers: [],
      resultImageUrl: null,
      currentSessionId: null,
      selectedModelId: null,
      warpEnabled: false,
      warpStrength: 50,
      shadowOpacity: 0.3,
      brightness: 1.0,
    }),
}));
