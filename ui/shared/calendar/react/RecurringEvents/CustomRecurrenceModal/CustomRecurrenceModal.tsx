/*
 * Copyright (C) 2023 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useCallback, useEffect, useState} from 'react'
import CanvasModal from '@canvas/instui-bindings/react/Modal'
import {useScope} from '@canvas/i18n'
import {Button} from '@instructure/ui-buttons'
import CustomRecurrence from '../CustomRecurrence/CustomRecurrence'
import RRuleHelper, {RRuleHelperSpec} from '../RRuleHelper'

const I18n = useScope('calendar_custom_recurring_event_custom_recurrence_modal')

const isValid = (spec: RRuleHelperSpec): boolean => {
  const rrule = new RRuleHelper(spec)
  try {
    return rrule.isValid()
  } catch (_e) {
    return false
  }
}

type CustomRecurrenceErrorState = {
  hasError: boolean
  errorMessage: string
}

class CustomRecurrenceErrorBoundary extends React.Component {
  state: CustomRecurrenceErrorState

  constructor(props: any) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorMessage: error.message,
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>{I18n.t('There was an error loading the custom recurrence editor')}</p>
          <p>{this.state.errorMessage}</p>
        </div>
      )
    }
    return this.props.children
  }
}

export type CustomRecurrenceModalProps = {
  eventStart: string
  locale: string
  timezone: string
  courseEndAt?: string
  RRULE: string
  isOpen: boolean
  onDismiss: () => void
  onSave: (RRULE: string) => void
}

export default function CustomRecurrenceModal({
  eventStart,
  locale,
  timezone,
  courseEndAt,
  RRULE,
  isOpen,
  onDismiss,
  onSave,
}: CustomRecurrenceModalProps) {
  const [currSpec, setCurrSpec] = useState<RRuleHelperSpec>(() => {
    return new RRuleHelper(RRuleHelper.parseString(RRULE)).spec
  })
  const [isValidState, setIsValidState] = useState<boolean>(() => isValid(currSpec))

  useEffect(() => {
    setIsValidState(isValid(currSpec))
  }, [currSpec])

  const handleChange = useCallback((newSpec: RRuleHelperSpec) => {
    setCurrSpec(newSpec)
  }, [])

  const handleSave = useCallback(() => {
    const rrule = new RRuleHelper(currSpec).toString()
    onSave(rrule)
  }, [currSpec, onSave])

  const Footer = useCallback(() => {
    return (
      <>
        <Button onClick={onDismiss}>{I18n.t('Cancel')}</Button>
        <Button
          interaction={isValidState ? 'enabled' : 'disabled'}
          type="submit"
          color="primary"
          margin="0 0 0 x-small"
          onClick={handleSave}
        >
          {I18n.t('Done')}
        </Button>
      </>
    )
  }, [handleSave, isValidState, onDismiss])

  return (
    <CanvasModal
      label={I18n.t('Custom Recurrence')}
      onDismiss={onDismiss}
      open={isOpen}
      footer={<Footer />}
      shouldCloseOnDocumentClick={false}
    >
      <div style={{minWidth: '28rem', minHeight: '20rem'}}>
        <CustomRecurrenceErrorBoundary>
          <CustomRecurrence
            eventStart={eventStart}
            locale={locale}
            timezone={timezone}
            courseEndAt={courseEndAt}
            rruleSpec={currSpec}
            onChange={handleChange}
          />
        </CustomRecurrenceErrorBoundary>
      </div>
    </CanvasModal>
  )
}
