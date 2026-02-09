import React, { useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";
import VerificationProgressSidebar from "../components/VerificationProgressSidebar";
import IdentificationCard from "../components/Identificationcard";
import type { VerificationStatus } from "../components/Verificationconstants";
import { mockDoctorData, mockCenterData } from "@/data/verifyInfoMock";

function VerifyInfo() {
  const [activeTab, setActiveTab] = useState("identificacion");
  const [isEditing, setIsEditing] = useState(false);

  const userRole = useAppStore((state) => state.user?.role);
  const isDoctor = userRole === "DOCTOR";

  const { doctorInfo, centerInfo, setDoctorInfo, setCenterInfo } =
    useVerifyInfoStore();

  // Usar datos del store o datos mock según el rol
  const currentInfo = isDoctor
    ? doctorInfo || mockDoctorData
    : centerInfo || mockCenterData;

  const currentStatus: VerificationStatus = currentInfo.verificationStatus;

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (data: DoctorPersonalInfo | CenterPersonalInfo) => {
    const updatedData = {
      ...data,
      verificationStatus: "PENDING" as const,
    };

    if (isDoctor) {
      setDoctorInfo(updatedData as DoctorPersonalInfo);
    } else {
      setCenterInfo(updatedData as CenterPersonalInfo);
    }

    setIsEditing(false);
  };

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-[3fr_7fr] gap-4">
            <VerificationProgressSidebar
              activeTab={activeTab}
              currentStatus={currentStatus}
              isDoctor={isDoctor}
              onTabChange={setActiveTab}
            />

            <main>
              {activeTab === "identificacion" && (
                <IdentificationCard
                  isDoctor={isDoctor}
                  isEditing={isEditing}
                  currentStatus={currentStatus}
                  currentInfo={currentInfo}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSubmit={handleSubmit}
                />
              )}
            </main>
          </section>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyInfo;
