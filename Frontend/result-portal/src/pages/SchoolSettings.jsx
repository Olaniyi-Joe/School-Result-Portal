import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function SchoolSettings() {
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    motto: '',
    website: '',
    principal_name: '',
    logo: null,
    principal_signature: null,
    school_stamp: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewUrls, setPreviewUrls] = useState({
    logo: null,
    principal_signature: null,
    school_stamp: null
  })

  useEffect(() => {
    fetchSchoolDetails()
  }, [])

  const fetchSchoolDetails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/school/')
      setSchoolData(response.data)
      // Set preview URLs for existing images
      setPreviewUrls({
        logo: response.data.logo,
        principal_signature: response.data.principal_signature,
        school_stamp: response.data.school_stamp
      })
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch school details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSchoolData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files[0]) {
      setSchoolData(prev => ({
        ...prev,
        [name]: files[0]
      }))
      // Create preview URL
      setPreviewUrls(prev => ({
        ...prev,
        [name]: URL.createObjectURL(files[0])
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData()
      Object.keys(schoolData).forEach(key => {
        if (schoolData[key] !== null) {
          formData.append(key, schoolData[key])
        }
      })

      if (schoolData.id) {
        await axios.put(`http://127.0.0.1:8000/api/school/${schoolData.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await axios.post('http://127.0.0.1:8000/api/school/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      toast.success('School details saved successfully')
      fetchSchoolDetails() // Refresh data
    } catch (error) {
      toast.error('Failed to save school details')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6">School Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">School Name</label>
              <input
                type="text"
                name="name"
                value={schoolData.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={schoolData.phone}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={schoolData.email || ''}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={schoolData.website || ''}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={schoolData.address}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                rows="3"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">School Motto</label>
              <input
                type="text"
                name="motto"
                value={schoolData.motto || ''}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Principal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Principal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Principal's Name</label>
              <input
                type="text"
                name="principal_name"
                value={schoolData.principal_name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Images and Signatures */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Logo and Signatures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* School Logo */}
            <div>
              <label className="block text-sm font-medium mb-1">School Logo</label>
              <div className="border rounded p-4">
                {previewUrls.logo && (
                  <img
                    src={previewUrls.logo}
                    alt="School Logo"
                    className="w-32 h-32 object-contain mx-auto mb-2"
                  />
                )}
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Principal's Signature */}
            <div>
              <label className="block text-sm font-medium mb-1">Principal's Signature</label>
              <div className="border rounded p-4">
                {previewUrls.principal_signature && (
                  <img
                    src={previewUrls.principal_signature}
                    alt="Principal's Signature"
                    className="w-32 h-32 object-contain mx-auto mb-2"
                  />
                )}
                <input
                  type="file"
                  name="principal_signature"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* School Stamp */}
            <div>
              <label className="block text-sm font-medium mb-1">School Stamp</label>
              <div className="border rounded p-4">
                {previewUrls.school_stamp && (
                  <img
                    src={previewUrls.school_stamp}
                    alt="School Stamp"
                    className="w-32 h-32 object-contain mx-auto mb-2"
                  />
                )}
                <input
                  type="file"
                  name="school_stamp"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}