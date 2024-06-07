import {
  NapiDeliveryStatus,
  NapiGroupMessageKind,
  type NapiMessage,
} from '@xmtp/mls-client-bindings-node'
import { ContentTypeId } from '@xmtp/xmtp-js'
import type { Client } from '@/Client'
import type { Conversation } from '@/Conversation'
import { nsToDate } from '@/helpers/date'

export type MessageKind = 'application' | 'membership_change'
export type MessageDeliveryStatus = 'unpublished' | 'published' | 'failed'

export class DecodedMessage {
  #client: Client
  content: any
  contentType: ContentTypeId
  conversation: Conversation
  conversationId: string
  deliveryStatus: MessageDeliveryStatus
  fallback?: string
  compression?: number
  id: string
  kind: MessageKind
  parameters: Record<string, string>
  senderInboxId: string
  sentAt: Date
  sentAtNs: number

  constructor(
    client: Client,
    conversation: Conversation,
    message: NapiMessage
  ) {
    this.#client = client
    this.conversation = conversation
    this.id = message.id
    this.sentAtNs = message.sentAtNs
    this.sentAt = nsToDate(message.sentAtNs)
    this.conversationId = message.convoId
    this.senderInboxId = message.senderInboxId

    switch (message.kind) {
      case NapiGroupMessageKind.Application:
        this.kind = 'application'
        break
      case NapiGroupMessageKind.MembershipChange:
        this.kind = 'membership_change'
        break
      // no default
    }

    switch (message.deliveryStatus) {
      case NapiDeliveryStatus.Unpublished:
        this.deliveryStatus = 'unpublished'
        break
      case NapiDeliveryStatus.Published:
        this.deliveryStatus = 'published'
        break
      case NapiDeliveryStatus.Failed:
        this.deliveryStatus = 'failed'
        break
      // no default
    }

    this.contentType = new ContentTypeId(message.content.type!)
    this.parameters = message.content.parameters
    this.fallback = message.content.fallback
    this.compression = message.content.compression
    this.content = this.#client.decodeContent(message, this.contentType)
  }
}
