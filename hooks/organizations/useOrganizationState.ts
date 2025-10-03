// hooks/organizations/useOrganizationState.ts
import { useState } from "react";
import { OrganizationType } from "@/types";

const useOrganizationState = () => {
  const [selectedOrganization, setSelectedOrganization] =
    useState<OrganizationType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] =
    useState<OrganizationType | null>(null);

  const handleEdit = (organization: OrganizationType) => {
    setSelectedOrganization(organization);
    setIsEditMode(true);
  };

  const handleDelete = (organization: OrganizationType) => {
    setOrganizationToDelete(organization);
    setShowDeleteModal(true);
  };

  const handleCreate = () => {
    setSelectedOrganization(null);
    setIsEditMode(true);
  };

  const handleCloseModal = () => {
    setSelectedOrganization(null);
    setIsEditMode(false);
    setShowDeleteModal(false);
    setOrganizationToDelete(null);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setOrganizationToDelete(null);
  };

  return {
    selectedOrganization,
    isEditMode,
    showDeleteModal,
    organizationToDelete,
    handleEdit,
    handleDelete,
    handleCreate,
    handleCloseModal,
    handleDeleteSuccess,
    setSelectedOrganization,
    setIsEditMode,
    setShowDeleteModal,
  };
};

export default useOrganizationState;
