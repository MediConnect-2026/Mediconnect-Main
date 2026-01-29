import React from "react";
import MCDashboardContentSimple from "@/shared/layout/MCDashboardContentSimple";
// Asegúrate de importar todos los componentes y hooks usados abajo

function MyAppointmentsPage() {
  // Aquí debes definir todos los estados y handlers usados en el layout:
  // globalFilter, setGlobalFilter, statusFilter, setStatusFilter, viewMode, setViewMode,
  // filteredUpcoming, paginatedUpcoming, handleViewDetails, handleReschedule, handleCancel, handleJoin,
  // upcomingPagination, setUpcomingPagination, upcomingTable,
  // filteredHistory, paginatedHistory, historyPagination, setHistoryPagination, historyTable,
  // statusLabels, AppointmentStatus, Popover, PopoverTrigger, PopoverContent, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SlidersHorizontal, List, LayoutGrid, AppointmentCard, AppointmentRow, PaginationControls

  return (
    <MCDashboardContentSimple>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mis Citas</h1>
            <div className="flex items-center gap-2">
              {/* Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Buscar
                      </label>
                      <Input
                        placeholder="Buscar por doctor o tipo..."
                        value={globalFilter}
                        onChange={(e) => {
                          setGlobalFilter(e.target.value);
                          setUpcomingPagination((p) => ({
                            ...p,
                            pageIndex: 0,
                          }));
                          setHistoryPagination((p) => ({ ...p, pageIndex: 0 }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Estado
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                          setStatusFilter(value);
                          setUpcomingPagination((p) => ({
                            ...p,
                            pageIndex: 0,
                          }));
                          setHistoryPagination((p) => ({ ...p, pageIndex: 0 }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {(
                            Object.keys(statusLabels) as AppointmentStatus[]
                          ).map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(globalFilter || statusFilter !== "all") && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setGlobalFilter("");
                          setStatusFilter("all");
                          setUpcomingPagination((p) => ({
                            ...p,
                            pageIndex: 0,
                          }));
                          setHistoryPagination((p) => ({ ...p, pageIndex: 0 }));
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* View Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none gap-2"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none gap-2"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </Button>
              </div>
            </div>
          </div>

          {/* Próximas Citas */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Próximas Citas
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredUpcoming.length} cita
                {filteredUpcoming.length !== 1 ? "s" : ""}
              </span>
            </div>

            {paginatedUpcoming.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay citas próximas que coincidan con los filtros.
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedUpcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoin={handleJoin}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {paginatedUpcoming.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoin={handleJoin}
                  />
                ))}
              </div>
            )}

            <PaginationControls
              currentPage={upcomingPagination.pageIndex + 1}
              totalPages={upcomingTable.getPageCount()}
              onPrevious={() => upcomingTable.previousPage()}
              onNext={() => upcomingTable.nextPage()}
              canPrevious={upcomingTable.getCanPreviousPage()}
              canNext={upcomingTable.getCanNextPage()}
            />
          </section>

          {/* Historial de Citas */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Historial de Citas
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredHistory.length} cita
                {filteredHistory.length !== 1 ? "s" : ""}
              </span>
            </div>

            {paginatedHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay citas en el historial que coincidan con los filtros.
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedHistory.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {paginatedHistory.map((appointment) => (
                  <AppointmentRow
                    key={appointment.id}
                    appointment={appointment}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            <PaginationControls
              currentPage={historyPagination.pageIndex + 1}
              totalPages={historyTable.getPageCount()}
              onPrevious={() => historyTable.previousPage()}
              onNext={() => historyTable.nextPage()}
              canPrevious={historyTable.getCanPreviousPage()}
              canNext={historyTable.getCanNextPage()}
            />
          </section>
        </div>
      </div>
    </MCDashboardContentSimple>
  );
}

export default MyAppointmentsPage;
