'use client';

import { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { apiClient } from '../../lib/api';

interface DataSourceFormData {
    source_type: string;
    reference: string;
    url: string;
}

interface DataSource {
    id: number;
    source_type: string;
    reference: string;
    url: string;
}

export default function DataSourceManager() {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<DataSource | null>(null);
    const [formData, setFormData] = useState<DataSourceFormData>({
        source_type: '',
        reference: '',
        url: ''
    });

    useEffect(() => {
        loadDataSources();
    }, []);

    const loadDataSources = async () => {
        try {
            const data = await apiClient.getDataSources();
            setDataSources(data);
        } catch (error) {
            console.error('Failed to load data sources:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSource) {
                await apiClient.updateDataSource(editingSource.id, formData);
            } else {
                await apiClient.createDataSource(formData);
            }
            setIsDialogOpen(false);
            loadDataSources();
            resetForm();
        } catch (error) {
            console.error('Failed to save data source:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette source de données ?')) {
            try {
                await apiClient.deleteDataSource(id);
                loadDataSources();
            } catch (error) {
                console.error('Failed to delete data source:', error);
            }
        }
    };

    const handleEdit = (source: DataSource) => {
        setEditingSource(source);
        setFormData({
            source_type: source.source_type,
            reference: source.reference,
            url: source.url
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            source_type: '',
            reference: '',
            url: ''
        });
        setEditingSource(null);
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sources de données</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            Ajouter une source
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingSource ? 'Modifier la source' : 'Ajouter une source'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="source_type">Type de source</Label>
                                    <Input
                                        id="source_type"
                                        value={formData.source_type}
                                        onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reference">Référence</Label>
                                    <Input
                                        id="reference"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    {editingSource ? 'Mettre à jour' : 'Ajouter'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type de source</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dataSources.map((source) => (
                        <TableRow key={source.id}>
                            <TableCell>{source.source_type}</TableCell>
                            <TableCell>{source.reference}</TableCell>
                            <TableCell>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {source.url}
                                </a>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(source)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(source.id)}
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