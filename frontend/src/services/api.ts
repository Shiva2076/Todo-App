import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'
import { clearCredentials, setAccessToken } from '@/store/slices/authSlice'
import type { AuthResponse, Task, User, ActivityLog, PageResponse, TaskStats } from '@/types'

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args, api, extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken
    if (refreshToken) {
      const refreshResult = await baseQuery(
        { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions
      )
      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as { accessToken: string }
        api.dispatch(setAccessToken(accessToken))
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(clearCredentials())
      }
    } else {
      api.dispatch(clearCredentials())
    }
  }

  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'User', 'ActivityLog', 'Stats'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<AuthResponse, { fullName: string; email: string; password: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    // Tasks
    getTasks: builder.query<PageResponse<Task>, {
      status?: string; priority?: string; assignedToId?: string;
      search?: string; page?: number; size?: number; sort?: string
    }>({
      query: (params) => ({ url: '/tasks', params }),
      providesTags: ['Task'],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    updateTask: builder.mutation<Task, { id: string; data: Partial<Task> }>({
      query: ({ id, data }) => ({ url: `/tasks/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { id }) => ['Task', { type: 'Task', id }, 'Stats'],
    }),
    patchTaskStatus: builder.mutation<Task, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/tasks/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_result, _error, { id }) => ['Task', { type: 'Task', id }, 'Stats'],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Task', 'Stats'],
    }),
    uploadAttachment: builder.mutation<Task, { taskId: string; file: File }>({
      query: ({ taskId, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return { url: `/tasks/${taskId}/attachments`, method: 'POST', body: formData }
      },
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),
    deleteAttachment: builder.mutation<Task, { taskId: string; attachmentId: string }>({
      query: ({ taskId, attachmentId }) => ({
        url: `/tasks/${taskId}/attachments/${attachmentId}`, method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, { taskId }) => [{ type: 'Task', id: taskId }],
    }),
    getTaskStats: builder.query<TaskStats, void>({
      query: () => '/tasks/stats',
      providesTags: ['Stats'],
    }),

    // Users
    getAllUsers: builder.query<User[], void>({
      query: () => '/users/',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, { fullName: string }>({
      query: (body) => ({ url: '/users/profile', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    uploadAvatar: builder.mutation<User, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return { url: '/users/avatar', method: 'POST', body: formData }
      },
      invalidatesTags: ['User'],
    }),

    // Activity
    getActivityLogs: builder.query<PageResponse<ActivityLog>, { page?: number; size?: number }>({
      query: (params) => ({ url: '/activity', params }),
      providesTags: ['ActivityLog'],
    }),
    getTaskActivityLogs: builder.query<PageResponse<ActivityLog>, { taskId: string; page?: number; size?: number }>({
      query: ({ taskId, ...params }) => ({ url: `/activity/task/${taskId}`, params }),
      providesTags: (_result, _error, { taskId }) => [{ type: 'ActivityLog', id: taskId }],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  usePatchTaskStatusMutation,
  useDeleteTaskMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useGetTaskStatsQuery,
  useGetAllUsersQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetActivityLogsQuery,
  useGetTaskActivityLogsQuery,
} = api
