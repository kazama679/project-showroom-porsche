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
import { DataTable } from "@/components/features/admin/data-table";
import { Button } from "@/components/features/admin/button";
import { Modal } from "@/components/features/admin/modal";
import { FormInput } from "@/components/features/admin/form-input";
import { useAdminPage } from "@/components/features/admin/admin-page-context";
import { Alert } from "@/components/features/admin/alert";
import { useTranslations } from 'next-intl';
import { brandService, Brand, BrandFormData } from "@/services/brand";
import { authService, getErrorMessage } from "@/services/auth";

export default function BrandsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  // State - data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10)
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
      showAlertMessage(t('brand_no_permission'), "warning");
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
      showAlertMessage(t('brand_no_permission'), "warning");
      return;
    }

    if (!formData.name.trim() || !formData.country.trim()) {
      showAlertMessage(t('brand_fill_required'), "error");
      return;
    }

    setSaving(true);
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, formData);
        showAlertMessage(t('brand_updated'), "success");
      } else {
        await brandService.create(formData);
        showAlertMessage(t('brand_created'), "success");
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
      showAlertMessage(t('brand_no_permission'), "warning");
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
      showAlertMessage(t('brand_deleted'), "success");
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

  useAdminPage({
    titleKey: 'brand_management',
    subtitleKey: 'brand_subtitle',
    actions: (
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"
          />
          <input
            type="text"
            placeholder={t('search_brands')}
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64"
          />
        </div>
        {/* Add Brand Button */}
        {isAdmin && (
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          >
            {t('add_brand')}
          </Button>
        )}
      </div>
    ),
  })

  return (
    <>
      <div className="space-y-6">
        {/* Permission Warning */}
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-sm border border-modena-yellow/30 bg-modena-yellow/10 dark:bg-modena-yellow/20">
            <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-near-black dark:text-light-gray-surface">
              {t('brand_no_permission')}
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"
            />
            <input
              type="text"
              placeholder={t('search_brands')}
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors"
            />
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-5">
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">
              {t('brand_total')}
            </p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">
              {totalElements}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
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
                label: t('brand_name'),
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
                label: t('brand_country'),
                sortable: true,
              },
              ...(isAdmin
                ? [
                    {
                      key: "actions" as keyof Brand,
                      label: t('actions'),
                      align: "center" as const,
                      render: (value: any, row: any) => (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(row as Brand);
                            }}
                            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 size={16} className="text-mid-gray" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteModal(row as Brand);
                            }}
                            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 size={16} className="text-brand-red" />
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
        title={editingBrand ? t('edit_brand') : t('add_new_brand')}
        subtitle={
          editingBrand
            ? t('update_brand_info')
            : t('add_brand_subtitle')
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              {tCommon('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingBrand ? t('update') : t('create')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label={t('brand_name')}
            placeholder={t('brand_placeholder_name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label={t('brand_country')}
            placeholder={t('brand_placeholder_country')}
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">Logo (Cloudinary)</label>
            {editingBrand?.logoUrl && !formData.logo && (
              <div className="mb-2">
                <Image src={editingBrand.logoUrl} alt="Current Brand" width={80} height={80} unoptimized className="object-contain bg-gray-100 dark:bg-neutral-900 rounded p-2" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
              className="w-full text-sm text-mid-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-neutral-700 file:text-near-black dark:file:text-white hover:file:bg-neutral-200 dark:hover:file:bg-[#505050] transition-colors" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('brand_confirm_delete')}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={saving}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={saving}
            >
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">
              {t('brand_confirm_delete_msg')}
            </p>
            {deletingBrand && (
              <p className="text-sm font-semibold text-near-black dark:text-white mt-2">
                {deletingBrand.name} — {deletingBrand.country}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
