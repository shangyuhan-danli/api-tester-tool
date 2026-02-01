import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://localhost:3001/api'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function App() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [templates, setTemplates] = useState([])
  const [groups, setGroups] = useState([])
  const [activeTab, setActiveTab] = useState('headers')
  const [templateName, setTemplateName] = useState('')
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [editingGroup, setEditingGroup] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    fetchHistory()
    fetchTemplates()
    fetchGroups()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`)
      const data = await res.json()
      setHistory(data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/templates`)
      const data = await res.json()
      setTemplates(data)
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/groups`)
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    }
  }

  const sendRequest = async () => {
    if (!url) return

    setLoading(true)
    setResponse(null)

    const headersObj = {}
    headers.forEach(h => {
      if (h.key && h.value) {
        headersObj[h.key] = h.value
      }
    })

    try {
      const res = await fetch(`${API_BASE}/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: headersObj,
          body: body ? JSON.parse(body) : undefined,
        }),
      })
      const data = await res.json()
      setResponse(data)
      fetchHistory()
    } catch (err) {
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const loadFromHistory = (item) => {
    setMethod(item.method)
    setUrl(item.url)
    if (item.headers) {
      const headerArray = Object.entries(item.headers).map(([key, value]) => ({ key, value }))
      setHeaders(headerArray.length ? headerArray : [{ key: '', value: '' }])
    }
    if (item.body) {
      setBody(JSON.stringify(item.body, null, 2))
    }
  }

  const saveTemplate = async () => {
    if (!templateName || !url) return

    const headersObj = {}
    headers.forEach(h => {
      if (h.key && h.value) {
        headersObj[h.key] = h.value
      }
    })

    try {
      await fetch(`${API_BASE}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          method,
          url,
          headers: headersObj,
          body: body ? JSON.parse(body) : undefined,
        }),
      })
      setTemplateName('')
      fetchTemplates()
    } catch (err) {
      console.error('Failed to save template:', err)
    }
  }

  const loadTemplate = (template) => {
    setMethod(template.method)
    setUrl(template.url)
    if (template.headers) {
      const headerArray = Object.entries(template.headers).map(([key, value]) => ({ key, value }))
      setHeaders(headerArray.length ? headerArray : [{ key: '', value: '' }])
    }
    if (template.body) {
      setBody(JSON.stringify(template.body, null, 2))
    }
  }

  const deleteTemplate = async (id) => {
    try {
      await fetch(`${API_BASE}/templates/${id}`, { method: 'DELETE' })
      fetchTemplates()
    } catch (err) {
      console.error('Failed to delete template:', err)
    }
  }

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE' })
      setHistory([])
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#10b981'
    if (status >= 300 && status < 400) return '#f59e0b'
    if (status >= 400) return '#ef4444'
    return '#6b7280'
  }

  // Group functions
  const openCreateGroupModal = () => {
    setEditingGroup(null)
    setNewGroupName('')
    setSelectedTemplates([])
    setShowGroupModal(true)
  }

  const openEditGroupModal = (group) => {
    setEditingGroup(group)
    setNewGroupName(group.name)
    setSelectedTemplates(group.templateIds || [])
    setShowGroupModal(true)
  }

  const toggleTemplateSelection = (templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const saveGroup = async () => {
    if (!newGroupName) return

    try {
      if (editingGroup) {
        await fetch(`${API_BASE}/groups/${editingGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newGroupName,
            templateIds: selectedTemplates,
          }),
        })
      } else {
        const res = await fetch(`${API_BASE}/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newGroupName }),
        })
        const newGroup = await res.json()
        if (selectedTemplates.length > 0) {
          await fetch(`${API_BASE}/groups/${newGroup.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newGroupName,
              templateIds: selectedTemplates,
            }),
          })
        }
      }
      setShowGroupModal(false)
      setNewGroupName('')
      setSelectedTemplates([])
      setEditingGroup(null)
      fetchGroups()
    } catch (err) {
      console.error('Failed to save group:', err)
    }
  }

  const deleteGroup = async (id) => {
    try {
      await fetch(`${API_BASE}/groups/${id}`, { method: 'DELETE' })
      fetchGroups()
    } catch (err) {
      console.error('Failed to delete group:', err)
    }
  }

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const getTemplateById = (id) => templates.find(t => t.id === id)

  // Get ungrouped templates
  const groupedTemplateIds = groups.flatMap(g => g.templateIds || [])
  const ungroupedTemplates = templates.filter(t => !groupedTemplateIds.includes(t.id))

  return (
    <div className="app">
      <header className="header">
        <h1>API Tester</h1>
      </header>

      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>Templates</h3>
              <button className="create-group-btn" onClick={openCreateGroupModal}>+ Group</button>
            </div>

            {/* Groups */}
            {groups.map(group => (
              <div key={group.id} className="group-container">
                <div className="group-header" onClick={() => toggleGroupExpand(group.id)}>
                  <span className="group-expand-icon">{expandedGroups[group.id] ? '▼' : '▶'}</span>
                  <span className="group-name">{group.name}</span>
                  <span className="group-count">{(group.templateIds || []).length}</span>
                  <button className="edit-group-btn" onClick={(e) => { e.stopPropagation(); openEditGroupModal(group); }}>✎</button>
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}>×</button>
                </div>
                {expandedGroups[group.id] && (
                  <div className="group-templates">
                    {(group.templateIds || []).map(templateId => {
                      const template = getTemplateById(templateId)
                      if (!template) return null
                      return (
                        <div key={template.id} className="template-item">
                          <span className={`method-badge ${template.method.toLowerCase()}`}>{template.method}</span>
                          <span className="template-name" onClick={() => loadTemplate(template)}>{template.name}</span>
                          <button className="delete-btn" onClick={() => deleteTemplate(template.id)}>×</button>
                        </div>
                      )
                    })}
                    {(group.templateIds || []).length === 0 && (
                      <p className="empty-text">No templates in this group</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Ungrouped templates */}
            <div className="template-list">
              {ungroupedTemplates.map(t => (
                <div key={t.id} className="template-item">
                  <span className={`method-badge ${t.method.toLowerCase()}`}>{t.method}</span>
                  <span className="template-name" onClick={() => loadTemplate(t)}>{t.name}</span>
                  <button className="delete-btn" onClick={() => deleteTemplate(t.id)}>×</button>
                </div>
              ))}
              {ungroupedTemplates.length === 0 && groups.length === 0 && (
                <p className="empty-text">No saved templates</p>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>History</h3>
              {history.length > 0 && (
                <button className="clear-btn" onClick={clearHistory}>Clear</button>
              )}
            </div>
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                  <span className={`method-badge ${item.method.toLowerCase()}`}>{item.method}</span>
                  <span className="history-url">{item.url}</span>
                  <span className="history-status" style={{ color: getStatusColor(item.response?.status) }}>
                    {item.response?.status}
                  </span>
                </div>
              ))}
              {history.length === 0 && <p className="empty-text">No request history</p>}
            </div>
          </div>
        </div>

        <div className="content">
          <div className="request-bar">
            <select value={method} onChange={e => setMethod(e.target.value)} className="method-select">
              {HTTP_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter request URL"
              className="url-input"
              onKeyPress={e => e.key === 'Enter' && sendRequest()}
            />
            <button onClick={sendRequest} disabled={loading || !url} className="send-btn">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="request-config">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'headers' ? 'active' : ''}`}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
              <button
                className={`tab ${activeTab === 'body' ? 'active' : ''}`}
                onClick={() => setActiveTab('body')}
              >
                Body
              </button>
              <button
                className={`tab ${activeTab === 'save' ? 'active' : ''}`}
                onClick={() => setActiveTab('save')}
              >
                Save
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'headers' && (
                <div className="headers-editor">
                  {headers.map((header, index) => (
                    <div key={index} className="header-row">
                      <input
                        type="text"
                        value={header.key}
                        onChange={e => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={e => updateHeader(index, 'value', e.target.value)}
                        placeholder="Header value"
                      />
                      <button onClick={() => removeHeader(index)} className="remove-btn">×</button>
                    </div>
                  ))}
                  <button onClick={addHeader} className="add-header-btn">+ Add Header</button>
                </div>
              )}

              {activeTab === 'body' && (
                <div className="body-editor">
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Request body (JSON)"
                    rows={8}
                  />
                </div>
              )}

              {activeTab === 'save' && (
                <div className="save-template">
                  <input
                    type="text"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="Template name"
                    className="template-name-input"
                  />
                  <button onClick={saveTemplate} disabled={!templateName || !url} className="save-btn">
                    Save Template
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="response-section">
            <h3>Response</h3>
            {response ? (
              <div className="response-content">
                {response.error ? (
                  <div className="response-error">
                    <p>Error: {response.error}</p>
                    {response.code && <p>Code: {response.code}</p>}
                  </div>
                ) : (
                  <>
                    <div className="response-meta">
                      <span className="status" style={{ color: getStatusColor(response.status) }}>
                        Status: {response.status} {response.statusText}
                      </span>
                      <span className="duration">Time: {response.duration}ms</span>
                    </div>
                    <div className="response-headers">
                      <h4>Response Headers</h4>
                      <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                    </div>
                    <div className="response-body">
                      <h4>Response Body</h4>
                      <pre>{typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}</pre>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="empty-response">Send a request to see the response</p>
            )}
          </div>
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGroup ? 'Edit Group' : 'Create Group'}</h3>
              <button className="modal-close" onClick={() => setShowGroupModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="group-name-input"
              />
              <div className="template-selector">
                <p className="selector-label">Select templates to add:</p>
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`template-select-item ${selectedTemplates.includes(t.id) ? 'selected' : ''}`}
                    onClick={() => toggleTemplateSelection(t.id)}
                  >
                    <span className="checkbox">{selectedTemplates.includes(t.id) ? '✓' : ''}</span>
                    <span className={`method-badge ${t.method.toLowerCase()}`}>{t.method}</span>
                    <span className="template-name">{t.name}</span>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="empty-text">No templates available</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={saveGroup} disabled={!newGroupName}>
                {editingGroup ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
