import React, { useState } from 'react';
import { createJob } from '../services/jobService';
import { HiOutlineBriefcase, HiOutlineBuildingOffice2, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import StatusAlert from '../components/StatusAlert';

const INITIAL_FORM_DATA = {
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  description: '',
  requirements: '',
};

const PostJob = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await createJob(formData);
      setMessageType('success');
      setMessage('Job posted successfully.');
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      setMessageType('error');
      setMessage(error?.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl space-y-6">
      <div className="hero-panel">
        <p className="hero-kicker">
          <HiOutlineBriefcase className="h-6 w-6" />
          New Opening
        </p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl text-center">Post a New Job</h1>
        <p className="mt-1 text-slate-100/90 text-center">Fill in the details below to publish a new opportunity.</p>
      </div>
      <StatusAlert
        message={message}
        variant={messageType}
        onClose={() => setMessage('')}
        autoHide={messageType === 'success'}
        duration={120000}
        floating
        className="right-6 top-6"
      />

      <form onSubmit={handleSubmit} className="space-y-6 surface-card p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-slate-700"><HiOutlineBuildingOffice2 className="h-4 w-4 text-blue-700" />Company</label>
            <input 
              type="text" 
              name="company" 
              placeholder="e.g. Google" 
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Job Title</label>
            <input 
              type="text" 
              name="title" 
              placeholder="e.g. Senior React Developer" 
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
            <input 
              type="text" 
              name="location" 
              placeholder="e.g. Mogadishu / Remote" 
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Job Type</label>
            <select 
              name="type" 
              value={formData.type}
              onChange={handleChange}
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-slate-700"><HiOutlineCurrencyDollar className="h-4 w-4 text-blue-700" />Salary</label>
          <input 
            type="text" 
            name="salary" 
            placeholder="e.g. $2000 / month" 
            value={formData.salary}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job Description</label>
          <textarea 
            name="description" 
            rows="5" 
            placeholder="Describe responsibilities, requirements, etc."
            value={formData.description}
            onChange={handleChange}
            className="w-full resize-none"
          ></textarea>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Requirements (comma separated)</label>
          <input 
            type="text" 
            name="requirements" 
            placeholder="React, Node.js, MongoDB" 
            value={formData.requirements}
            onChange={handleChange}
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Posting...' : 'Post Job'}
        </button>
      </form>
      </div>
    </div>
  );
};

export default PostJob;
