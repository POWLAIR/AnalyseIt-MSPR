'use client';

import { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { apiClient } from '../../lib/api';
import { format } from 'date-fns';

interface DailyStatsFormData {
    id_epidemic: string;
    id_source: number;
    id_loc: number;
    date: string;
    cases: number;
    active: number;
    deaths: number;
    recovered: number;
    new_cases: number;
    new_deaths: number;
    new_recovered: number;
}

interface Location {
    id: number;
    country: string;
    region: string | null;
}

interface DataSource {
    id: number;
    source_type: string;
    reference: string;
}

interface Epidemic {
    id: string;
    name: string;
}

export default function DailyStatsManager() {
    const [dailyStats, setDailyStats] = useState<any[]>([]);
    const [epidemics, setEpidemics] = useState<Epidemic[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStats, setEditingStats] = useState<any | null>(null);
    const [formData, setFormData] = useState<DailyStatsFormData>({
        id_epidemic: '',
        id_source: 0,
        id_loc: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        cases: 0,
        active: 0,
        deaths: 0,
        recovered: 0,
        new_cases: 0,
        new_deaths: 0,
        new_recovered: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, epidemicsData, locationsData, sourcesData] = await Promise.all([
                apiClient.getDailyStats(),
                apiClient.getPandemics(),
                apiClient.getLocations(),
                apiClient.getDataSources()
            ]);

            setDailyStats(statsData);
            setEpidemics(epidemicsData);
            setLocations(locationsData);
            setDataSources(sourcesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                id_epidemic: parseInt(formData.id_epidemic)
            };
            if (editingStats) {
                await apiClient.updateDailyStats(editingStats.id, dataToSubmit);
            } else {
                await apiClient.createDailyStats(dataToSubmit);
            }
            setIsDialogOpen(false);
            loadData();
            resetForm();
        } catch (error) {
            console.error('Failed to save daily stats:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ces statistiques ?')) {
            try {
                await apiClient.deleteDailyStats(id);
                loadData();
            } catch (error) {
                console.error('Failed to delete daily stats:', error);
            }
        }
    };

    const handleEdit = (stats: any) => {
        setEditingStats(stats);
        setFormData({
            id_epidemic: stats.id_epidemic,
            id_source: stats.id_source,
            id_loc: stats.id_loc,
            date: format(new Date(stats.date), 'yyyy-MM-dd'),
            cases: stats.cases,
            active: stats.active,
            deaths: stats.deaths,
            recovered: stats.recovered,
            new_cases: stats.new_cases,
            new_deaths: stats.new_deaths,
            new_recovered: stats.new_recovered
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            id_epidemic: '',
            id_source: 0,
            id_loc: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
            cases: 0,
            active: 0,
            deaths: 0,
            recovered: 0,
            new_cases: 0,
            new_deaths: 0,
            new_recovered: 0
        });
        setEditingStats(null);
    };

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Statistiques journalières</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}>
                            Ajouter des statistiques
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingStats ? 'Modifier les statistiques' : 'Ajouter des statistiques'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="epidemic">Pandémie</Label>
                                    <Select
                                        value={formData.id_epidemic}
                                        onValueChange={(value: string) => setFormData({ ...formData, id_epidemic: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une pandémie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {epidemics.map((epidemic) => (
                                                <SelectItem key={epidemic.id} value={epidemic.id}>
                                                    {epidemic.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="location">Localisation</Label>
                                    <Select
                                        value={formData.id_loc.toString()}
                                        onValueChange={(value: string) => setFormData({ ...formData, id_loc: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une localisation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((location) => (
                                                <SelectItem key={location.id} value={location.id.toString()}>
                                                    {location.country} {location.region ? `(${location.region})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Select
                                        value={formData.id_source.toString()}
                                        onValueChange={(value: string) => setFormData({ ...formData, id_source: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dataSources.map((source) => (
                                                <SelectItem key={source.id} value={source.id.toString()}>
                                                    {source.source_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cases">Cas totaux</Label>
                                        <Input
                                            id="cases"
                                            type="number"
                                            value={formData.cases}
                                            onChange={(e) => setFormData({ ...formData, cases: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="active">Cas actifs</Label>
                                        <Input
                                            id="active"
                                            type="number"
                                            value={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="deaths">Décès totaux</Label>
                                        <Input
                                            id="deaths"
                                            type="number"
                                            value={formData.deaths}
                                            onChange={(e) => setFormData({ ...formData, deaths: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="recovered">Guérisons totales</Label>
                                        <Input
                                            id="recovered"
                                            type="number"
                                            value={formData.recovered}
                                            onChange={(e) => setFormData({ ...formData, recovered: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="new_cases">Nouveaux cas</Label>
                                        <Input
                                            id="new_cases"
                                            type="number"
                                            value={formData.new_cases}
                                            onChange={(e) => setFormData({ ...formData, new_cases: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="new_deaths">Nouveaux décès</Label>
                                        <Input
                                            id="new_deaths"
                                            type="number"
                                            value={formData.new_deaths}
                                            onChange={(e) => setFormData({ ...formData, new_deaths: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="new_recovered">Nouvelles guérisons</Label>
                                        <Input
                                            id="new_recovered"
                                            type="number"
                                            value={formData.new_recovered}
                                            onChange={(e) => setFormData({ ...formData, new_recovered: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    {editingStats ? 'Mettre à jour' : 'Ajouter'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Pandémie</TableHead>
                        <TableHead>Localisation</TableHead>
                        <TableHead>Cas totaux</TableHead>
                        <TableHead>Cas actifs</TableHead>
                        <TableHead>Décès</TableHead>
                        <TableHead>Guérisons</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dailyStats.map((stats) => (
                        <TableRow key={stats.id}>
                            <TableCell>{format(new Date(stats.date), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{stats.epidemic.name}</TableCell>
                            <TableCell>{stats.location.country}</TableCell>
                            <TableCell>{stats.cases}</TableCell>
                            <TableCell>{stats.active}</TableCell>
                            <TableCell>{stats.deaths}</TableCell>
                            <TableCell>{stats.recovered}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(stats)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(stats.id)}
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