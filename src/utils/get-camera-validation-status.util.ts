export enum CameraValidationStatus {
  Unknown,
  Detected,
  DetectedAndValidated,
  DetectedAndDiscarded,
  Undetected,
  UndetectedAndAdded
}

export function getCameraValidationStatus(type, metadata) {
  const validationValue = metadata?.validation?.[type]
  const isValidationPresent = typeof metadata?.validation?.[type] === 'boolean'

  const detectionValue = metadata?.detection?.[type]
  const isDetectionPresent = typeof metadata?.detection?.[type] === 'boolean'

  if (isDetectionPresent) {
    if (isValidationPresent) {
      if (detectionValue === true && validationValue === true) {
        return CameraValidationStatus.DetectedAndValidated
      }

      if (detectionValue === true && validationValue === false) {
        return CameraValidationStatus.DetectedAndDiscarded
      }

      if (detectionValue === false && validationValue === true) {
        return CameraValidationStatus.UndetectedAndAdded
      }

      if (detectionValue === false && validationValue === false) {
        return CameraValidationStatus.Undetected
      }
    } else {
      if (detectionValue === true) {
        return CameraValidationStatus.Detected
      }

      if (detectionValue === false) {
        return CameraValidationStatus.Undetected
      }
    }
  } else {
    if (isValidationPresent) {
      if (validationValue === true) {
        return CameraValidationStatus.UndetectedAndAdded
      }

      if (validationValue === false || validationValue === null) {
        return CameraValidationStatus.Undetected
      }
    }
  }

  return CameraValidationStatus.Unknown
}
