# Dashboard YouTube Video Manager Implementation

## Task
Implement YouTube video management in the admin dashboard. Admins can add, view, and remove YouTube video IDs for lectures. The video ID is stored securely and streamed to students via server proxy (students never see the actual video ID).

---

## API Endpoints

### 1. Set YouTube Video for Lecture
- **Method:** `POST`
- **URL:** `/api/admin/lectures/youtube/{lecture_id}`
- **Headers:** 
  - `Authorization: Bearer {admin_token}`
  - `Content-Type: application/json`

**Request Body:**
```json
{
  "youtube_video_id": "dQw4w9WgXcQ"
}
```

**Success Response:**
```json
{
  "status": 200,
  "message": "YouTube video set successfully",
  "data": {
    "lecture_id": 76,
    "youtube_video_id": "dQw4w9WgXcQ",
    "created_at": "2026-01-29T10:00:00.000000Z"
  },
  "isSuccess": true
}
```

---

### 2. Get YouTube Video for Lecture
- **Method:** `GET`
- **URL:** `/api/admin/lectures/youtube/{lecture_id}`
- **Headers:** 
  - `Authorization: Bearer {admin_token}`

**Success Response (Has Video):**
```json
{
  "status": 200,
  "message": "success",
  "data": {
    "lecture_id": 76,
    "youtube_video_id": "dQw4w9WgXcQ",
    "status": "active",
    "created_at": "2026-01-29T10:00:00.000000Z"
  },
  "isSuccess": true
}
```

**Success Response (No Video):**
```json
{
  "status": 200,
  "message": "No YouTube video set for this lecture",
  "data": null,
  "isSuccess": true
}
```

---

### 3. Remove YouTube Video from Lecture
- **Method:** `DELETE`
- **URL:** `/api/admin/lectures/youtube/{lecture_id}`
- **Headers:** 
  - `Authorization: Bearer {admin_token}`

**Success Response:**
```json
{
  "status": 200,
  "message": "YouTube video removed successfully",
  "data": null,
  "isSuccess": true
}
```

---

## Implementation

### 1. API Service Methods

Add to your admin API service:
```javascript
// services/adminLectureService.js

export const youtubeVideoApi = {
  // Get YouTube video for a lecture
  async getYoutubeVideo(lectureId) {
    const response = await axios.get(`/api/admin/lectures/youtube/${lectureId}`);
    return response.data;
  },

  // Set YouTube video for a lecture
  async setYoutubeVideo(lectureId, youtubeVideoId) {
    const response = await axios.post(`/api/admin/lectures/youtube/${lectureId}`, {
      youtube_video_id: youtubeVideoId
    });
    return response.data;
  },

  // Remove YouTube video from a lecture
  async removeYoutubeVideo(lectureId) {
    const response = await axios.delete(`/api/admin/lectures/youtube/${lectureId}`);
    return response.data;
  }
};
```

---

### 2. Vue Component (Options API)

```vue
<!-- components/admin/YoutubeVideoManager.vue -->

<template>
  <div class="youtube-manager">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fab fa-youtube text-danger me-2"></i>
          YouTube Video
        </h5>
      </div>
      
      <div class="card-body">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Has Video -->
        <div v-else-if="youtubeVideoId" class="youtube-preview">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <span class="badge bg-success me-2">Active</span>
              <code class="video-id">{{ youtubeVideoId }}</code>
            </div>
            <div>
              <button 
                class="btn btn-sm btn-outline-primary me-2" 
                @click="previewVideo"
                title="Preview"
              >
                <i class="fas fa-play"></i>
              </button>
              <button 
                class="btn btn-sm btn-outline-danger" 
                @click="confirmRemove"
                :disabled="removing"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <!-- Preview Thumbnail -->
          <div class="thumbnail-wrapper">
            <img 
              :src="`https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`"
              :alt="'Video thumbnail'"
              class="img-fluid rounded"
            />
            <div class="play-overlay" @click="previewVideo">
              <i class="fas fa-play-circle"></i>
            </div>
          </div>
        </div>

        <!-- No Video - Add Form -->
        <div v-else>
          <p class="text-muted mb-3">No YouTube video set for this lecture.</p>
          
          <form @submit.prevent="saveVideo">
            <div class="mb-3">
              <label class="form-label">YouTube Video ID or URL</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="inputValue"
                placeholder="Enter video ID or paste YouTube URL"
                :disabled="saving"
              />
              <div class="form-text">
                Examples: <code>dQw4w9WgXcQ</code> or <code>https://youtube.com/watch?v=dQw4w9WgXcQ</code>
              </div>
            </div>
            
            <!-- Preview before save -->
            <div v-if="extractedVideoId" class="mb-3">
              <label class="form-label">Preview:</label>
              <div class="thumbnail-wrapper small">
                <img 
                  :src="`https://img.youtube.com/vi/${extractedVideoId}/mqdefault.jpg`"
                  alt="Video thumbnail"
                  class="img-fluid rounded"
                />
              </div>
              <small class="text-success">
                <i class="fas fa-check me-1"></i>
                Video ID: {{ extractedVideoId }}
              </small>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="!extractedVideoId || saving"
            >
              <span v-if="saving">
                <i class="fas fa-spinner fa-spin me-1"></i> Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-1"></i> Save Video
              </span>
            </button>
          </form>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mt-3 mb-0">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="alert alert-success mt-3 mb-0">
          {{ success }}
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div class="modal fade" ref="previewModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark">
          <div class="modal-header border-0">
            <h5 class="modal-title text-white">Video Preview</h5>
            <button type="button" class="btn-close btn-close-white" @click="closePreview"></button>
          </div>
          <div class="modal-body p-0">
            <div class="ratio ratio-16x9">
              <iframe 
                v-if="showPreview"
                :src="`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1`"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove Confirmation Modal -->
    <div class="modal fade" ref="removeModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Remove YouTube Video</h5>
            <button type="button" class="btn-close" @click="closeRemoveModal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to remove the YouTube video from this lecture?</p>
            <p class="text-muted small">Students will no longer be able to watch this video.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeRemoveModal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="removeVideo"
              :disabled="removing"
            >
              <span v-if="removing">
                <i class="fas fa-spinner fa-spin me-1"></i> Removing...
              </span>
              <span v-else>Remove Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import { youtubeVideoApi } from '@/services/adminLectureService';

export default {
  name: 'YoutubeVideoManager',
  
  props: {
    lectureId: {
      type: [Number, String],
      required: true
    }
  },

  data() {
    return {
      loading: true,
      saving: false,
      removing: false,
      youtubeVideoId: null,
      inputValue: '',
      error: null,
      success: null,
      showPreview: false,
      previewModalInstance: null,
      removeModalInstance: null
    };
  },

  computed: {
    extractedVideoId() {
      return this.extractVideoId(this.inputValue);
    }
  },

  mounted() {
    this.fetchYoutubeVideo();
    this.previewModalInstance = new Modal(this.$refs.previewModal);
    this.removeModalInstance = new Modal(this.$refs.removeModal);
  },

  methods: {
    // Extract video ID from URL or direct input
    extractVideoId(input) {
      if (!input) return null;
      
      const trimmed = input.trim();
      
      // Already a video ID (11 characters)
      if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
      }
      
      // YouTube URL patterns
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
      ];
      
      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) return match[1];
      }
      
      return null;
    },

    async fetchYoutubeVideo() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await youtubeVideoApi.getYoutubeVideo(this.lectureId);
        if (response.data) {
          this.youtubeVideoId = response.data.youtube_video_id;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load YouTube video';
      } finally {
        this.loading = false;
      }
    },

    async saveVideo() {
      if (!this.extractedVideoId) return;
      
      this.saving = true;
      this.error = null;
      this.success = null;
      
      try {
        await youtubeVideoApi.setYoutubeVideo(this.lectureId, this.extractedVideoId);
        this.youtubeVideoId = this.extractedVideoId;
        this.inputValue = '';
        this.success = 'YouTube video saved successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => { this.success = null; }, 3000);
        
        // Emit event for parent component
        this.$emit('video-updated', this.youtubeVideoId);
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to save YouTube video';
      } finally {
        this.saving = false;
      }
    },

    confirmRemove() {
      this.removeModalInstance.show();
    },

    closeRemoveModal() {
      this.removeModalInstance.hide();
    },

    async removeVideo() {
      this.removing = true;
      this.error = null;
      
      try {
        await youtubeVideoApi.removeYoutubeVideo(this.lectureId);
        this.youtubeVideoId = null;
        this.closeRemoveModal();
        this.success = 'YouTube video removed successfully!';
        
        setTimeout(() => { this.success = null; }, 3000);
        
        this.$emit('video-updated', null);
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to remove YouTube video';
      } finally {
        this.removing = false;
      }
    },

    previewVideo() {
      this.showPreview = true;
      this.previewModalInstance.show();
    },

    closePreview() {
      this.showPreview = false;
      this.previewModalInstance.hide();
    }
  },

  beforeUnmount() {
    this.previewModalInstance?.dispose();
    this.removeModalInstance?.dispose();
  }
};
</script>

<style scoped>
.youtube-manager .video-id {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.thumbnail-wrapper {
  position: relative;
  max-width: 320px;
  cursor: pointer;
}

.thumbnail-wrapper.small {
  max-width: 200px;
}

.thumbnail-wrapper img {
  width: 100%;
  height: auto;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.2s;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.5);
}

.play-overlay i {
  font-size: 3rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.thumbnail-wrapper.small .play-overlay i {
  font-size: 2rem;
}
</style>
```

---

### 3. Usage in Lecture Edit Page

```vue
<!-- In your LectureEdit.vue or similar -->

<template>
  <div class="lecture-edit">
    <!-- Other lecture fields... -->
    
    <!-- YouTube Video Section -->
    <YoutubeVideoManager 
      :lecture-id="lecture.id"
      @video-updated="onYoutubeVideoUpdated"
    />
    
    <!-- Other sections... -->
  </div>
</template>

<script>
import YoutubeVideoManager from '@/components/admin/YoutubeVideoManager.vue';

export default {
  components: {
    YoutubeVideoManager
  },
  
  data() {
    return {
      lecture: {
        id: null,
        // ... other lecture data
      }
    };
  },
  
  methods: {
    onYoutubeVideoUpdated(videoId) {
      console.log('YouTube video updated:', videoId);
      // Optionally refresh lecture data or update UI
    }
  }
};
</script>
```

---

### 4. Vue 3 Composition API Version (Optional)

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Modal } from 'bootstrap';
import { youtubeVideoApi } from '@/services/adminLectureService';

const props = defineProps({
  lectureId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['video-updated']);

// Refs
const previewModal = ref(null);
const removeModal = ref(null);

// State
const loading = ref(true);
const saving = ref(false);
const removing = ref(false);
const youtubeVideoId = ref(null);
const inputValue = ref('');
const error = ref(null);
const success = ref(null);
const showPreview = ref(false);

let previewModalInstance = null;
let removeModalInstance = null;

// Computed
const extractedVideoId = computed(() => extractVideoId(inputValue.value));

// Methods
function extractVideoId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchYoutubeVideo() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await youtubeVideoApi.getYoutubeVideo(props.lectureId);
    if (response.data) {
      youtubeVideoId.value = response.data.youtube_video_id;
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load';
  } finally {
    loading.value = false;
  }
}

async function saveVideo() {
  if (!extractedVideoId.value) return;
  
  saving.value = true;
  error.value = null;
  success.value = null;
  
  try {
    await youtubeVideoApi.setYoutubeVideo(props.lectureId, extractedVideoId.value);
    youtubeVideoId.value = extractedVideoId.value;
    inputValue.value = '';
    success.value = 'YouTube video saved successfully!';
    setTimeout(() => { success.value = null; }, 3000);
    emit('video-updated', youtubeVideoId.value);
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save';
  } finally {
    saving.value = false;
  }
}

async function removeVideo() {
  removing.value = true;
  error.value = null;
  
  try {
    await youtubeVideoApi.removeYoutubeVideo(props.lectureId);
    youtubeVideoId.value = null;
    removeModalInstance.hide();
    success.value = 'YouTube video removed!';
    setTimeout(() => { success.value = null; }, 3000);
    emit('video-updated', null);
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to remove';
  } finally {
    removing.value = false;
  }
}

function previewVideo() {
  showPreview.value = true;
  previewModalInstance.show();
}

function closePreview() {
  showPreview.value = false;
  previewModalInstance.hide();
}

function confirmRemove() {
  removeModalInstance.show();
}

function closeRemoveModal() {
  removeModalInstance.hide();
}

// Lifecycle
onMounted(() => {
  fetchYoutubeVideo();
  previewModalInstance = new Modal(previewModal.value);
  removeModalInstance = new Modal(removeModal.value);
});

onBeforeUnmount(() => {
  previewModalInstance?.dispose();
  removeModalInstance?.dispose();
});
</script>
```

---

## Video ID Extraction Examples

| Input | Extracted ID |
|-------|--------------|
| `dQw4w9WgXcQ` | `dQw4w9WgXcQ` |
| `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | `dQw4w9WgXcQ` |
| `https://youtu.be/dQw4w9WgXcQ` | `dQw4w9WgXcQ` |
| `https://youtube.com/embed/dQw4w9WgXcQ` | `dQw4w9WgXcQ` |
| `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120` | `dQw4w9WgXcQ` |

---

## Important Notes

1. **Video ID is stored securely** - Only admins can see the actual video ID
2. **Students never see video ID** - They only get a signed player page URL
3. **Thumbnail preview** - Uses YouTube's public thumbnail API
4. **Admin preview** - Uses youtube-nocookie.com for GDPR compliance
5. **Validation** - Extracts video ID from various YouTube URL formats

---

## Testing Checklist

- [ ] Can add YouTube video by ID
- [ ] Can add YouTube video by URL (various formats)
- [ ] Shows thumbnail preview before saving
- [ ] Shows thumbnail after saving
- [ ] Preview modal plays video
- [ ] Can remove YouTube video
- [ ] Confirmation dialog before removal
- [ ] Error messages display correctly
- [ ] Success messages display and auto-hide
- [ ] Loading states work properly
- [ ] Form clears after successful save
