// src/components/PurchaseRequestForm.tsx

import * as React from 'react';
import { useState } from 'react';
import { SharePointService } from '../services/SharePointService';
import { SharePointConfig, IPurchaseRequest } from '../services/sharepoint.config';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import styles from './PurchaseRequestForm.module.scss';

export interface IPurchaseRequestFormProps {
  spService: SharePointService;
  onClose: () => void;
  onSuccess: () => void;
}

export const PurchaseRequestForm: React.FC<IPurchaseRequestFormProps> = ({ spService, onClose, onSuccess }) => {
  
  const [formData, setFormData] = useState<Partial<IPurchaseRequest>>({
    Title: '',
    DepartmentArea: '',
    Category: '',
    ItemDescription: '',
    ItemLink: '',
    FundingSource: '',
    FundingSourceOther: '',
    OtherComments: '',
    EstimatedCost: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ Title: string; EMail: string } | null>(null);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await spService.getCurrentUser();
    setCurrentUser(user);
    setFormData(prev => ({
      ...prev,
      Requester: user
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.Title?.trim()) {
      newErrors.Title = 'Title is required';
    }

    if (!formData.DepartmentArea) {
      newErrors.DepartmentArea = 'Department Area is required';
    }

    if (!formData.Category) {
      newErrors.Category = 'Category is required';
    }

    if (!formData.ItemDescription?.trim()) {
      newErrors.ItemDescription = 'Item Description is required';
    }

    if (!formData.FundingSource) {
      newErrors.FundingSource = 'Funding Source is required';
    }

    if (formData.FundingSource === 'Other' && !formData.FundingSourceOther?.trim()) {
      newErrors.FundingSourceOther = 'Please explain the funding source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await spService.createPurchaseRequest(formData as IPurchaseRequest);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting purchase request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Purchase Request</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* Title */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Request Title</label>
          <input
            type="text"
            value={formData.Title}
            onChange={(e) => handleInputChange('Title', e.target.value)}
            placeholder="Brief title for this request"
            className={errors.Title ? styles.error : ''}
          />
          {errors.Title && <span className={styles.errorText}>{errors.Title}</span>}
        </div>

        {/* Department Area */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Department Area</label>
          <select
            value={formData.DepartmentArea}
            onChange={(e) => handleInputChange('DepartmentArea', e.target.value)}
            className={errors.DepartmentArea ? styles.error : ''}
          >
            <option value="">Select Department Area...</option>
            {SharePointConfig.choices.departmentAreas.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.DepartmentArea && <span className={styles.errorText}>{errors.DepartmentArea}</span>}
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Category</label>
          <select
            value={formData.Category}
            onChange={(e) => handleInputChange('Category', e.target.value)}
            className={errors.Category ? styles.error : ''}
          >
            <option value="">Select Category...</option>
            {SharePointConfig.choices.purchaseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.Category && <span className={styles.errorText}>{errors.Category}</span>}
        </div>

        {/* Item Description */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Item Description</label>
          <textarea
            value={formData.ItemDescription}
            onChange={(e) => handleInputChange('ItemDescription', e.target.value)}
            placeholder="Detailed description of the item(s) needed"
            rows={4}
            className={errors.ItemDescription ? styles.error : ''}
          />
          {errors.ItemDescription && <span className={styles.errorText}>{errors.ItemDescription}</span>}
        </div>

        {/* Item Link */}
        <div className={styles.formGroup}>
          <label>Item Link</label>
          <input
            type="url"
            value={formData.ItemLink}
            onChange={(e) => handleInputChange('ItemLink', e.target.value)}
            placeholder="https://example.com/product-link"
          />
          <small>Optional: Link to product page or specifications</small>
        </div>

        {/* Estimated Cost */}
        <div className={styles.formGroup}>
          <label>Estimated Cost</label>
          <div className={styles.currencyInput}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.EstimatedCost}
              onChange={(e) => handleInputChange('EstimatedCost', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Funding Source */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Funding Source</label>
          <select
            value={formData.FundingSource}
            onChange={(e) => handleInputChange('FundingSource', e.target.value)}
            className={errors.FundingSource ? styles.error : ''}
          >
            <option value="">Select Funding Source...</option>
            {SharePointConfig.choices.fundingSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          {errors.FundingSource && <span className={styles.errorText}>{errors.FundingSource}</span>}
        </div>

        {/* If Other Funding Source */}
        {formData.FundingSource === 'Other' && (
          <div className={styles.formGroup}>
            <label className={styles.required}>Please Explain Funding Source</label>
            <textarea
              value={formData.FundingSourceOther}
              onChange={(e) => handleInputChange('FundingSourceOther', e.target.value)}
              placeholder="Explain the funding source"
              rows={3}
              className={errors.FundingSourceOther ? styles.error : ''}
            />
            {errors.FundingSourceOther && <span className={styles.errorText}>{errors.FundingSourceOther}</span>}
          </div>
        )}

        {/* Requester */}
        <div className={styles.formGroup}>
          <label>Requester</label>
          <input
            type="text"
            value={currentUser?.Title || 'Loading...'}
            disabled
            className={styles.disabledInput}
          />
          <small>Your name is automatically filled</small>
        </div>

        {/* Other Comments */}
        <div className={styles.formGroup}>
          <label>Other Comments</label>
          <textarea
            value={formData.OtherComments}
            onChange={(e) => handleInputChange('OtherComments', e.target.value)}
            placeholder="Any additional information or special requests"
            rows={4}
          />
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
