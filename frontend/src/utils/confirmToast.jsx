import toast from 'react-hot-toast'

export const confirmToast = (message) => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div
          style={{
            background: '#1f2937',
            color: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            minWidth: '360px',
            border: '1px solid #374151',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '16px',
            }}
          >
            <button
              onClick={() => {
                resolve(false)
                toast.remove(t.id)
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => {
                resolve(true)
                toast.remove(t.id)
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    )
  })
}