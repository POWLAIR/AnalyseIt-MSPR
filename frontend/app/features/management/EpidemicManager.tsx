'use client';

import { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { apiClient } from '../../lib/api';
import { Pandemic } from '../../lib/api';
import { format } from 'date-fns';

interface EpidemicFormData {
    name: string;
    type: string;
    description: string;
    startDate: string;
    endDate?: string;
    country: string;
    transmissionRate: number;
    mortalityRate: number;
    totalCases: number;
    totalDeaths: number;
}

export default function EpidemicManager() {
    const [epidemics, setEpidemics] = useState<Pandemic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEpidemic, setEditingEpidemic] = useState<Pandemic | null>(null);
    const [formData, setFormData] = useState<EpidemicFormData>({
        name: '',
        type: '',
        description: '',
        startDate: '',
        endDate: '',
        country: '',
        transmissionRate: 0,
        mortalityRate: 0,
        totalCases: 0,
        totalDeaths: 0
    });

    useEffect(() => {
        loadEpidemics();
    }, []);

    const loadEpidemics = async () => {
        try {
            const data = await apiClient.getPandemics();
            setEpidemics(data.items);
        } catch (error) {
            console.error('Failed to load epidemics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingEpidemic) {
                // Update existing epidemic
                await apiClient.updateEpidemic(editingEpidemic.id, {
                    ...formData,
                    id: editingEpidemic.id
                });
            } else {
                // Create new epidemic
                await apiClient.createEpidemic(formData);
            }
            setIsDialogOpen(false);
            loadEpidemics();
            resetForm();
        } catch (error) {
            console.error('Failed to save epidemic:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pandémie ?')) {
            try {
                await apiClient.deleteEpidemic(id);
                loadEpidemics();
            } catch (error) {
                console.error('Failed to delete epidemic:', error);
            }
        }
    };

    const handleEdit = (epidemic: Pandemic) => {
        setEditingEpidemic(epidemic);
        setFormData({
            name: epidemic.name,
            type: epidemic.type,
            description: epidemic.description || '',
            startDate: epidemic.startDate || '',
            endDate: epidemic.endDate || '',
            country: epidemic.country || '',
            transmissionRate: epidemic.transmissionRate || 0,
            mortalityRate: epidemic.mortalityRate || 0,
            totalCases: epidemic.totalCases || 0,
            totalDeaths: epidemic.totalDeaths || 0
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            description: '',
            startDate: '',
            endDate: '',
            country: '',
            transmissionRate: 0,
            mortalityRate: 0,
            totalCases: 0,
            totalDeaths: 0
        });
        setEditingEpidemic(null);
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Liste des pandémies</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            Ajouter une pandémie
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingEpidemic ? 'Modifier la pandémie' : 'Ajouter une pandémie'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nom</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Input
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Pays</Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Date de début</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">Date de fin</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    {editingEpidemic ? 'Mettre à jour' : 'Ajouter'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Pays</TableHead>
                        <TableHead>Date de début</TableHead>
                        <TableHead>Date de fin</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {epidemics.map((epidemic) => (
                        <TableRow key={epidemic.id}>
                            <TableCell>{epidemic.name}</TableCell>
                            <TableCell>{epidemic.type}</TableCell>
                            <TableCell>{epidemic.country}</TableCell>
                            <TableCell>
                                {epidemic.startDate ? format(new Date(epidemic.startDate), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                {epidemic.endDate ? format(new Date(epidemic.endDate), 'dd/MM/yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-sm ${epidemic.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {epidemic.active ? 'Active' : 'Terminée'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(epidemic)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(epidemic.id)}
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