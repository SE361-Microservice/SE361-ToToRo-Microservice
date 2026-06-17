import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import savedListingService from '../services/savedListingService';

export default function useSavedListings() {
  const { isAuthenticated } = useAuthStore();
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial saved listings
  const fetchSavedListings = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Fetch all saved listings (or first few pages) to get the IDs
      const res = await savedListingService.getSavedListings({ size: 1000 });
      const ids = new Set(res.content.map(listing => String(listing.id)));
      setSavedListingIds(ids);
    } catch (error) {
      console.error('Failed to fetch saved listings', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSavedListings();
  }, [fetchSavedListings]);

  // Toggle save status
  const toggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isAuthenticated) {
      console.warn('User must be logged in to save listings');
      return;
    }

    // Optimistic update
    setSavedListingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      await savedListingService.toggleSave(Number(id));
    } catch (error) {
      console.error('Failed to toggle save listing', error);
      // Revert optimistic update
      setSavedListingIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };

  return {
    savedListingIds,
    toggleSave,
    isLoading,
    fetchSavedListings
  };
}
