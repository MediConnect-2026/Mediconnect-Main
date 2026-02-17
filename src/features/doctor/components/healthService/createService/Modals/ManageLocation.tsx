import { MCModalBase } from "@/shared/components/MCModalBase";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import MCInput from "@/shared/components/forms/MCInput";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { locationSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useRef, useState, useEffect, useCallback } from "react";
import React from "react";

interface manageLocationProps {
  locationSelected?: number | undefined;
  children: React.ReactNode;
  triggerClassName?: string;
}

function ManageLocation({
  locationSelected,
  children,
  triggerClassName,
}: manageLocationProps) {
  const { t } = useTranslation("doctor");
  const formRef = useRef<any>(null);

  const locatonFormSchema = locationSchema(t);

  const setlocationField = useCreateServicesStore((s) => s.setlocationField);
  const locationData = useCreateServicesStore((s) => s.locationData);
  const clearLocationData = useCreateServicesStore((s) => s.clearLocationData);

  const [shouldLoadData, setShouldLoadData] = useState(false);
  const [coordinates, setCoordinates] = useState({
    lat: 18.4861,
    lng: -69.9312,
  });

  const handleTriggerClick = useCallback(() => {
    setShouldLoadData(true);
  }, []);

  useEffect(() => {
    if (!shouldLoadData) return;

    if (locationSelected !== undefined && locationData) {
      setCoordinates({
        lat: locationData.coordinates?.latitude || 18.4861,
        lng: locationData.coordinates?.longitude || -69.9312,
      });
    } else {
      clearLocationData();
      setCoordinates({
        lat: 18.4861,
        lng: -69.9312,
      });
    }

    setShouldLoadData(false);
  }, [shouldLoadData, locationSelected, locationData, clearLocationData]);

  const handleMapChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setlocationField("coordinates", { latitude: lat, longitude: lng });
    if (formRef.current) {
      formRef.current.setValue("coordinates", {
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleLocationDetails = (details: {
    address: string;
    neighborhood: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => {
    setlocationField("address", details.address);
    setlocationField("province", details.province || "");
    setlocationField("municipality", details.municipality || "");

    if (formRef.current) {
      formRef.current.setValue("address", details.address);
      formRef.current.setValue("province", details.province || "");
      formRef.current.setValue("municipality", details.municipality || "");
    }
  };

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
  };

  const submitRef = useRef<any>(null);
  const handleConfirm = () => {
    submitRef.current?.();
    console.log("Datos enviados desde modal:", locationData);
  };

  const handleClose = () => {
    clearLocationData();
  };

  useEffect(() => {
    if (formRef.current && formRef.current.reset) {
      formRef.current.reset({
        name: locationData.name || "",
        address: locationData.address || "",
        province: locationData.province || "",
        municipality: locationData.municipality || "",
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      });
    }
  }, [locationData, coordinates]);

  const triggerWithHandler = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : children;

  return (
    <MCModalBase
      id="manage-location-modal"
      title={t("createService.location.manageLocation")}
      size="lgAuto"
      variant="decide"
      onConfirm={handleConfirm}
      onClose={handleClose}
      trigger={triggerWithHandler}
      triggerClassName={triggerClassName}
    >
      <div className="flex flex-col gap-8">
        <MapSelectLocation
          value={coordinates}
          onChange={handleMapChange}
          onLocationDetails={handleLocationDetails}
        />
        <MCFormWrapper
          submitRef={submitRef}
          schema={locatonFormSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: locationData.name || "",
            address: locationData.address || "",
            province: locationData.province || "",
            municipality: locationData.municipality || "",
            coordinates: {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
            },
          }}
          formRef={formRef}
        >
          <div className="w-full grid grid-cols-2 gap-4">
            <MCInput
              name="name"
              label={t("form.locationName")}
              maxLength={30}
              placeholder={t("form.locationNamePlaceholder")}
              onChange={(e) => setlocationField("name", e.target.value)}
            />
            <MCInput
              name="address"
              label={t("form.address")}
              placeholder={t("form.addressPlaceholder")}
              value={locationData.address}
              onChange={(e) => setlocationField("address", e.target.value)}
            />
            <MCInput
              name="province"
              label={t("form.province")}
              placeholder={t("form.provincePlaceholder")}
              value={locationData.province}
              onChange={(e) => setlocationField("province", e.target.value)}
            />
            <MCInput
              name="municipality"
              label={t("form.municipality")}
              placeholder={t("form.municipalityPlaceholder")}
              value={locationData.municipality}
              onChange={(e) => setlocationField("municipality", e.target.value)}
            />
          </div>
        </MCFormWrapper>
      </div>
    </MCModalBase>
  );
}

export default ManageLocation;
