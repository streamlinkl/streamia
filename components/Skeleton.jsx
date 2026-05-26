const pulse = "animate-pulse bg-gray-200 rounded"

export function SkeletonLine({ w = 'w-full', h = 'h-3' }) {
  return <div className={`${pulse} ${w} ${h} rounded-full`} />
}
export function SkeletonAvatar({ size = 'w-10 h-10' }) {
  return <div className={`${pulse} ${size} rounded-full flex-shrink-0`} />
}
export function SkeletonBox({ w = 'w-full', h = 'h-20' }) {
  return <div className={`${pulse} ${w} ${h} rounded-xl`} />
}
export function SkeletonPost() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-32" h="h-3" />
          <SkeletonLine w="w-20" h="h-2.5" />
        </div>
      </div>
      <SkeletonLine h="h-3" />
      <SkeletonLine w="w-4/5" h="h-3" />
      <SkeletonLine w="w-2/3" h="h-3" />
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <SkeletonLine w="w-16" h="h-3" />
        <SkeletonLine w="w-16" h="h-3" />
      </div>
    </div>
  )
}
export function SkeletonJob() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5">
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-3/4" h="h-3" />
          <SkeletonLine w="w-1/2" h="h-2.5" />
          <div className="flex gap-2 mt-1">
            <SkeletonLine w="w-16" h="h-5" />
            <SkeletonLine w="w-20" h="h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
export function SkeletonProfile() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <SkeletonBox h="h-14" />
      <div className="p-4 space-y-2">
        <SkeletonAvatar size="w-12 h-12" />
        <SkeletonLine w="w-2/3" h="h-3" />
        <SkeletonLine w="w-1/2" h="h-2.5" />
        <SkeletonBox h="h-8" />
      </div>
    </div>
  )
}
export function SkeletonConversation() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
      <SkeletonAvatar />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine w="w-2/3" h="h-3" />
        <SkeletonLine w="w-4/5" h="h-2.5" />
      </div>
    </div>
  )
}
export function SkeletonStat() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-center">
      <SkeletonBox w="w-8 mx-auto" h="h-6" />
      <SkeletonLine w="w-16 mx-auto" h="h-6" />
      <SkeletonLine w="w-20 mx-auto" h="h-2.5" />
    </div>
  )
}
