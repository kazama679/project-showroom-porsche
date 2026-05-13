"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/admin/button";
import { Modal } from "@/components/admin/modal";
import { FormInput } from "@/components/admin/form-input";
import { PageLayout } from "@/components/admin/page-layout";
import { Alert } from "@/components/admin/alert";
import { useLanguage } from "@/lib/language-context";
import {
  bodyTypeService,
  BodyType,
  BodyTypeFormData,
} from "@/lib/body-type";
import { authService, getErrorMessage } from "@/lib/auth";

export default function BodyTypesPage() {
  const { t } = useLanguage();

  const [items, setItems] = useState<BodyType[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BodyType | null>(null);
  const [deletingItem, setDeletingItem] = useState<BodyType | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">(
    "success",
  );

  const [formData, setFormData] = useState<BodyTypeFormData>({
    name: "",
    description: null,
  });

  const isAdmin = authService.isAdmin();
  const isAuthenticated = authService.isAuthenticated();

  const showAlertMessage = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bodyTypeService.findAll();
      setItems(data);
    } catch (error) {
      showAlertMessage(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleOpenModal = (item?: BodyType) => {
    if (!isAdmin) {
      showAlertMessage(t("admin.no_permission"), "warning");
      return;
    }
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description ?? null,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: "", description: null });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showAlertMessage(t("admin.no_permission"), "warning");
      return;
    }
    if (!formData.name.trim()) {
      showAlertMessage(t("admin.fill_required"), "error");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await bodyTypeService.update(editingItem.id, formData);
        showAlertMessage(t("admin.update"), "success");
      } else {
        await bodyTypeService.create(formData);
        showAlertMessage(t("admin.create"), "success");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch (error) {
      showAlertMessage(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteModal = (item: BodyType) => {
    if (!isAdmin) {
      showAlertMessage(t("admin.no_permission"), "warning");
      return;
    }
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem || !isAdmin) return;
    setSaving(true);
    try {
      await bodyTypeService.delete(deletingItem.id);
      showAlertMessage(t("admin.delete"), "success");
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      fetchAll();
    } catch (error) {
      showAlertMessage(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title={t("admin.body_design_management")}
      subtitle={t("admin.body_design_subtitle")}
      actions={
        isAdmin ? (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          >
            {t("admin.add_body_design")}
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-[2px] border border-[#F6E500]/30 bg-[#F6E500]/10 dark:bg-[#F6E500]/20">
            <ShieldAlert size={20} className="text-[#B8A500] flex-shrink-0" />
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">
              {t("admin.no_permission")}
            </p>
          </div>
        )}

        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              { key: "id", label: "ID", align: "center", sortable: true },
              { key: "name", label: t("admin.body_design_name"), sortable: true },
              {
                key: "description",
                label: t("admin.body_design_description"),
                render: (v: any) => v || "—",
              },
              ...(isAdmin
                ? [
                    {
                      key: "id" as keyof BodyType,
                      label: t("admin.actions"),
                      align: "center" as const,
                      render: (value: any, row: any) => (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(row as BodyType);
                            }}
                            className="cursor-pointer p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                            title={t("admin.edit")}
                          >
                            <Edit2 size={16} className="text-[#8F8F8F]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(row as BodyType);
                            }}
                            className="cursor-pointer p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                            title={t("admin.delete")}
                          >
                            <Trash2 size={16} className="text-[#DA291C]" />
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
            data={items}
            loading={loading}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem ? t("admin.edit_body_design") : t("admin.add_body_design")
        }
        subtitle={t("admin.body_design_subtitle")}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingItem ? t("admin.update") : t("admin.create")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label={t("admin.body_design_name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label={t("admin.body_design_description")}
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value || null,
              })
            }
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("admin.confirm_delete")}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={saving}
            >
              {t("admin.delete")}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-[#DA291C]/10 dark:bg-[#DA291C]/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-[#DA291C]" />
          </div>
          <div>
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">
              {t("admin.are_you_sure")}
            </p>
            {deletingItem && (
              <p className="text-sm font-semibold text-[#181818] dark:text-white mt-2">
                {deletingItem.name}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}

