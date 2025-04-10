'use client';

import { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { apiClient } from '../../lib/api';
import type { Localisation } from "../../lib/api";
import { useToast } from "../../components/ui/use-toast";

interface LocationFormData {
    country: string;
    region: string | null;
    iso_code: string | null;
}

export default function LocationManager() {
    const [locations, setLocations] = useState<Localisation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Localisation | null>(null);
    const [formData, setFormData] = useState<LocationFormData>({
        country: '',
        region: null,
        iso_code: null,
    });
    const { toast } = useToast();

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const data = await apiClient.getLocations();
            setLocations(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load locations",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLocation) {
                await apiClient.updateLocation(editingLocation.id, formData);
            } else {
                await apiClient.createLocation(formData);
            }
            setIsDialogOpen(false);
            loadLocations();
            resetForm();
            toast({
                title: "Success",
                description: "Location created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save location",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette localisation ?')) {
            try {
                await apiClient.deleteLocation(id);
                loadLocations();
                toast({
                    title: "Success",
                    description: "Location deleted successfully",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete location",
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (location: Localisation) => {
        setEditingLocation(location);
        setFormData({
            country: location.country,
            region: location.region,
            iso_code: location.iso_code
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            country: '',
            region: null,
            iso_code: null,
        });
        setEditingLocation(null);
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Liste des localisations</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            Ajouter une localisation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLocation ? 'Modifier la localisation' : 'Ajouter une localisation'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Pays</Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="region">Région</Label>
                                    <Input
                                        id="region"
                                        value={formData.region || ''}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value || null })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="iso_code">Code ISO</Label>
                                    <Input
                                        id="iso_code"
                                        value={formData.iso_code || ''}
                                        onChange={(e) => setFormData({ ...formData, iso_code: e.target.value || null })}
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    {editingLocation ? 'Mettre à jour' : 'Ajouter'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Pays</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Code ISO</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map((location) => (
                        <TableRow key={location.id}>
                            <TableCell>{location.country}</TableCell>
                            <TableCell>{location.region || '-'}</TableCell>
                            <TableCell>{location.iso_code || '-'}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(location)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(location.id)}
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 