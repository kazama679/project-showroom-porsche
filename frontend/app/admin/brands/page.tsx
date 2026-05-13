"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/admin/button";
import { Modal } from "@/components/admin/modal";
import { FormInput } from "@/components/admin/form-input";
import { PageLayout } from "@/components/admin/page-layout";
import { Alert } from "@/components/admin/alert";
import { useLanguage } from "@/lib/language-context";
import { brandService, Brand, BrandFormData } from "@/lib/brand";
import { authService, getErrorMessage } from "@/lib/auth";

export default function BrandsPage() {
  const { t } = useLanguage();

  // State - data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // State - modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  // State - alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">(
    "success",
  );

  // State - form
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    country: "",
    logo: null,
  });

  // Role check
  const isAdmin = authService.isAdmin();
  const isAuthenticated = authService.isAuthenticated();

  // Show alert helper
  const showAlertMessage = (
    message: string,
    type: "success" | "error" | "warning" = "success",
  ) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Fetch brands from API
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.findAll(
        searchKeyword,
        currentPage - 1,
        pageSize,
      );
      setBrands(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (error) {
      showAlertMessage(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, currentPage, pageSize]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
    }, 400);
    setSearchTimeout(timeout);
  };

  // Open modal for add/edit
  const handleOpenModal = (brand?: Brand) => {
    if (!isAdmin) {
      showAlertMessage(t("admin.brand_no_permission"), "warning");
      return;
    }
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        country: brand.country,
        logo: null,
      });
    } else {
      setEditingBrand(null);
      setFormData({ name: "", country: "", logo: null });
    }
    setIsModalOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!isAdmin) {
      showAlertMessage(t("admin.brand_no_permission"), "warning");
      return;
    }

    if (!formData.name.trim() || !formData.country.trim()) {
      showAlertMessage(t("admin.brand_fill_required"), "error");
      return;
    }

    setSaving(true);
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, formData);
        showAlertMessage(t("admin.brand_updated"), "success");
      } else {
        await brandService.create(formData);
        showAlertMessage(t("admin.brand_created"), "success");
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      showAlertMessage(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation
  const handleOpenDeleteModal = (brand: Brand) => {
    if (!isAdmin) {
      showAlertMessage(t("admin.brand_no_permission"), "warning");
      return;
    }
    setDeletingBrand(brand);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingBrand || !isAdmin) return;

    setSaving(true);
    try {
      await brandService.delete(deletingBrand.id);
      showAlertMessage(t("admin.brand_deleted"), "success");
      setIsDeleteModalOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch (error) {
      showAlertMessage(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PageLayout
      title={t("admin.brand_management")}
      subtitle={t("admin.brand_subtitle")}
      actions={
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]"
            />
            <input
              type="text"
              placeholder={t("admin.search_brands")}
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors w-64"
            />
          </div>
          {/* Add Brand Button */}
          {isAdmin && (
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => handleOpenModal()}
            >
              {t("admin.add_brand")}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Permission Warning */}
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-[2px] border border-[#F6E500]/30 bg-[#F6E500]/10 dark:bg-[#F6E500]/20">
            <ShieldAlert size={20} className="text-[#B8A500] flex-shrink-0" />
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">
              {t("admin.brand_no_permission")}
            </p>
          </div>
        )}

        {/* Alert */}
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Mobile Search */}
        <div className="sm:hidden">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]"
            />
            <input
              type="text"
              placeholder={t("admin.search_brands")}
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors"
            />
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-5">
            <p className="text-xs font-medium text-[#8F8F8F] dark:text-[#D2D2D2] uppercase tracking-wider">
              {t("admin.brand_total")}
            </p>
            <p className="text-2xl font-bold text-[#181818] dark:text-white mt-2">
              {totalElements}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              {
                key: "id",
                label: "ID",
                align: "center",
                sortable: true,
              },
              {
                key: "name",
                label: t("admin.brand_name"),
                sortable: true,
                render: (value, row) => (
                  <div className="flex items-center gap-3">
                    {(row as Brand).logoUrl && (
                      <Image
                        src={(row as Brand).logoUrl!}
                        alt={value}
                        width={32}
                        height={32}
                        unoptimized
                        className="object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span className="font-medium">{value}</span>
                  </div>
                ),
              },
              {
                key: "country",
                label: t("admin.brand_country"),
                sortable: true,
              },
              ...(isAdmin
                ? [
                    {
                      key: "id" as keyof Brand,
                      label: t("admin.actions"),
                      align: "center" as const,
                      render: (value: any, row: any) => (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(row as Brand);
                            }}
                            className="cursor-pointer p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                            title={t("admin.edit")}
                          >
                            <Edit2 size={16} className="text-[#8F8F8F]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(row as Brand);
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
            data={brands}
            loading={loading}
            pagination={{
              pageSize,
              currentPage,
              total: totalElements,
              onPageChange: handlePageChange,
            }}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? t("admin.edit_brand") : t("admin.add_new_brand")}
        subtitle={
          editingBrand
            ? t("admin.update_brand_info")
            : t("admin.add_brand_subtitle")
        }
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
              {editingBrand ? t("admin.update") : t("admin.create")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label={t("admin.brand_name")}
            placeholder={t("admin.brand_placeholder_name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label={t("admin.brand_country")}
            placeholder={t("admin.brand_placeholder_country")}
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#181818] dark:text-[#D2D2D2]">Logo (Cloudinary)</label>
            {editingBrand?.logoUrl && !formData.logo && (
              <div className="mb-2">
                <Image src={editingBrand.logoUrl} alt="Current Brand" width={80} height={80} unoptimized className="object-contain bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded p-2" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
              className="w-full text-sm text-[#8F8F8F] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#F5F5F5] dark:file:bg-[#404040] file:text-[#181818] dark:file:text-white hover:file:bg-[#EBEBEB] dark:hover:file:bg-[#505050] transition-colors" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("admin.brand_confirm_delete")}
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
              {t("admin.brand_confirm_delete_msg")}
            </p>
            {deletingBrand && (
              <p className="text-sm font-semibold text-[#181818] dark:text-white mt-2">
                {deletingBrand.name} — {deletingBrand.country}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
