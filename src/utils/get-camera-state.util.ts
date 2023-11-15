import {
  CameraValidationStatus,
  getCameraValidationStatus
} from './get-camera-validation-status.util'

export function getCameraState(type, measurements) {
  const hasTypeChip = measurements?.some((m) => m.metadata?.detection?.[type])

  const hasAtLeastOneValidation = measurements?.some((m) => {
    const status = getCameraValidationStatus(type, m.metadata)

    return (
      status === CameraValidationStatus.DetectedAndValidated ||
      status === CameraValidationStatus.UndetectedAndAdded
    )
  })

  const validatedOrDetectedMeasurements = measurements?.filter((m) => {
    const validation = m.metadata?.validation?.[type]
    const detection = m.metadata?.detection?.[type]

    return (typeof validation !== 'undefined' && validation !== null) || detection === true
  })

  console.log(validatedOrDetectedMeasurements)

  const hasAllValidationsDiscarded =
    validatedOrDetectedMeasurements.length > 0 &&
    validatedOrDetectedMeasurements.every(
      (m) =>
        getCameraValidationStatus(type, m.metadata) === CameraValidationStatus.DetectedAndDiscarded
    )

  return [hasTypeChip, hasAtLeastOneValidation, hasAllValidationsDiscarded]
}
