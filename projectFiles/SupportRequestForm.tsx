// src/components/SupportRequestForm.tsx

import * as React from 'react';
import { useState } from 'react';
import { SharePointService } from '../services/SharePointService';
import { SharePointConfig, ISupportRequest } from '../services/sharepoint.config';
import styles from './SupportRequestForm.module.scss';

export interface ISupportRequestFormProps {
  spService: SharePointService;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupportRequestForm: React.FC<ISupportRequestFormProps> = ({ spService, onClose, onSuccess }) => {
  
  const [formData, setFormData] = useState<Partial<ISupportRequest>>({
    Title: '',
    RequestType: '',
    DepartmentArea: '',
    Category: '',
    Details: '',
    Priority: 'Medium',
    NeedByDate: undefined
  });

  const [attachments, setAttachments] = useState<File[]>([]);
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
      CreatedBy: user
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.Title?.trim()) {
      newErrors.Title = 'Title is required';
    }

    if (!formData.RequestType) {
      newErrors.RequestType = 'Request Type is required';
    }

    if (!formData.DepartmentArea) {
      newErrors.DepartmentArea = 'Department Area is required';
    }

    if (!formData.Category) {
      newErrors.Category = 'Category is required';
    }

    if (!formData.Details?.trim()) {
      newErrors.Details = 'Details are required';
    }

    if (!formData.Priority) {
      newErrors.Priority = 'Priority is required';
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
      // Create the request
      const requestId = await spService.createSupportRequest(formData as ISupportRequest);
      
      // Upload attachments if any
      for (const file of attachments) {
        const arrayBuffer = await file.arrayBuffer();
        await spService.addAttachmentToSupportRequest(requestId, file.name, arrayBuffer);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Support / Issue Request</h2>
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
            placeholder="Brief description of the issue or request"
            className={errors.Title ? styles.error : ''}
          />
          {errors.Title && <span className={styles.errorText}>{errors.Title}</span>}
        </div>

        {/* Request Type */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Request Type</label>
          <select
            value={formData.RequestType}
            onChange={(e) => handleInputChange('RequestType', e.target.value)}
            className={errors.RequestType ? styles.error : ''}
          >
            <option value="">Select Request Type...</option>
            {SharePointConfig.choices.requestTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.RequestType && <span className={styles.errorText}>{errors.RequestType}</span>}
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
            {SharePointConfig.choices.supportCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.Category && <span className={styles.errorText}>{errors.Category}</span>}
        </div>

        {/* Priority */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Priority</label>
          <div className={styles.priorityOptions}>
            {SharePointConfig.choices.priorities.map(priority => (
              <label key={priority} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.Priority === priority}
                  onChange={(e) => handleInputChange('Priority', e.target.value)}
                />
                <span className={`${styles.priorityBadge} ${styles[priority.toLowerCase()]}`}>
                  {priority}
                </span>
              </label>
            ))}
          </div>
          {errors.Priority && <span className={styles.errorText}>{errors.Priority}</span>}
        </div>

        {/* Details */}
        <div className={styles.formGroup}>
          <label className={styles.required}>Details</label>
          <textarea
            value={formData.Details}
            onChange={(e) => handleInputChange('Details', e.target.value)}
            placeholder="Please provide detailed information about the issue or request"
            rows={6}
            className={errors.Details ? styles.error : ''}
          />
          {errors.Details && <span className={styles.errorText}>{errors.Details}</span>}
          <small>Include any error messages, steps to reproduce, or specific requirements</small>
        </div>

        {/* Need By Date */}
        <div className={styles.formGroup}>
          <label>Need By Date</label>
          <input
            type="date"
            value={formData.NeedByDate ? formData.NeedByDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('NeedByDate', e.target.value ? new Date(e.target.value) : undefined)}
            min={new Date().toISOString().split('T')[0]}
          />
          <small>Optional: When do you need this resolved?</small>
        </div>

        {/* Attachments */}
        <div className={styles.formGroup}>
          <label>Attachments</label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <label htmlFor="attachments" className={styles.fileLabel}>
              <i className="fas fa-cloud-upload-alt"></i> Choose Files
            </label>
          </div>
          
          {attachments.length > 0 && (
            <div className={styles.attachmentList}>
              {attachments.map((file, index) => (
                <div key={index} className={styles.attachmentItem}>
                  <i className="fas fa-file"></i>
                  <span>{file.name}</span>
                  <span className={styles.fileSize}>({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className={styles.removeAttachment}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
          <small>You can attach screenshots, documents, or other relevant files</small>
        </div>

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
