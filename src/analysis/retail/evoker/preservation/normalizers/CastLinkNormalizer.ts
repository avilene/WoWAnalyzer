import SPELLS from 'common/SPELLS';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { Options } from 'parser/core/Module';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  AbilityEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

export const FROM_HARDCAST = 'FromHardcast'; // for linking a buffapply or heal to its cast
export const FROM_TEMPORAL_ANOMALY = 'FromTemporalAnomaly'; // for linking TA echo apply to TA shield apply
export const ECHO_REMOVAL = 'EchoRemoval'; // for linking echo removal to echo apply
export const TA_ECHO_REMOVAL = 'TaEchoTemoval'; // for linking TA echo removal to echo apply
export const ECHO_TEMPORAL_ANOMALY = 'TemporalAnomaly'; // for linking BuffApply/Heal to echo removal
export const ECHO = 'Echo'; // for linking BuffApply/Heal to echo removal
export const ESSENCE_BURST_CONSUME = 'EssenceBurstConsumption'; // link essence cast to removing the essence burst buff
export const DREAM_BREATH_CALL_OF_YSERA = 'DreamBreathCallOfYsera'; // link DB hit to buff removal
export const DREAM_BREATH_CALL_OF_YSERA_HOT = 'DreamBreathCallOfYseraHoT'; // link DB hot to buff removal
export const LIVING_FLAME_CALL_OF_YSERA = 'LivingFlameCallOfYsera'; // link buffed living flame to buff removal
export const FIELD_OF_DREAMS_PROC = 'FromFieldOfDreams'; // link EB heal to fluttering heal
export const HEAL_GROUPING = 'HealGrouping'; // link EB healevents and TA pulses together to easily fetch groups of heals/absorbs
export const SHIELD_FROM_TA_CAST = 'ShieldFromTACast';

const CAST_BUFFER_MS = 100;
const EB_BUFFER_MS = 2000;
const EB_VARIANCE_BUFFER = 150; // servers are bad and EB can take over or under 2s to actually trigger
const MAX_ECHO_DURATION = 20000; // 15s with 30% inc = 19s
const TA_BUFFER_MS = 6000 + CAST_BUFFER_MS; //TA pulses over 6s at 0% haste

/*
  This file is for attributing echo applications to hard casts or to temporal anomaly.
  It is needed because echo can apply indrectly from temporal anomaly and
  not just from a hard cast and has a reduced transfer rate
*/

const EVENT_LINKS: EventLink[] = [
  /* ECHO CAST TO ECHO APPLY LINKING */
  //link shield apply to cast event
  {
    linkRelation: SHIELD_FROM_TA_CAST,
    linkingEventId: [SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: [TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id],
    referencedEventType: [EventType.Cast],
    backwardBufferMs: TA_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT);
    },
  },
  // link Echo apply to its CastEvent
  {
    linkRelation: FROM_HARDCAST,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.Cast],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
  },
  //link echo apply to the Temporal Anomaly shield application
  {
    linkRelation: FROM_TEMPORAL_ANOMALY,
    linkingEventId: [TALENTS_EVOKER.ECHO_TALENT.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: SPELLS.TEMPORAL_ANOMALY_SHIELD.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  /* ECHO APPLY TO ECHO REMOVAL LINKING */
  // link echo removal to echo apply
  {
    linkRelation: ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_HARDCAST);
    },
  },
  // link ta echo removal to apply
  {
    linkRelation: TA_ECHO_REMOVAL,
    linkingEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    linkingEventType: EventType.RemoveBuff,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    backwardBufferMs: MAX_ECHO_DURATION,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, FROM_TEMPORAL_ANOMALY);
    },
  },
  /* ECHO REMOVAL TO HOT APPLY */
  //link hardcast echo removal to hot application
  {
    linkRelation: ECHO,
    linkingEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkedEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, ECHO_REMOVAL);
    },
  },
  //link TA echo removal to hot application
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: [SPELLS.REVERSION_ECHO.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, TA_ECHO_REMOVAL);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  /* ECHO REMOVAL TO HEAL */
  // link echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO,
    linkingEventId: [
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM.id,
      TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
    ],
    linkingEventType: [EventType.Heal],
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, ECHO_REMOVAL);
    },
  },
  // link EB heal to echo remove
  {
    linkRelation: ECHO,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: EB_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return !HasRelatedEvent(referencedEvent, ECHO_REMOVAL);
    },
  },
  // link TA echo removal to echo heal (for non-hots)
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: [
      SPELLS.EMERALD_BLOSSOM_ECHO.id,
      SPELLS.SPIRITBLOOM_SPLIT.id,
      SPELLS.SPIRITBLOOM.id,
      SPELLS.DREAM_BREATH_ECHO.id,
      SPELLS.LIVING_FLAME_HEAL.id,
      TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
    ],
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: EventType.RemoveBuff,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, TA_ECHO_REMOVAL);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // special handling for TA Echo EB because it heals 3-5 targets and happens after 2s
  {
    linkRelation: ECHO_TEMPORAL_ANOMALY,
    linkingEventId: SPELLS.EMERALD_BLOSSOM_ECHO.id,
    linkingEventType: EventType.Heal,
    referencedEventId: TALENTS_EVOKER.ECHO_TALENT.id,
    referencedEventType: [EventType.RemoveBuff],
    forwardBufferMs: EB_BUFFER_MS + 250,
    additionalCondition(linkingEvent, referencedEvent) {
      return HasRelatedEvent(referencedEvent, TA_ECHO_REMOVAL);
    },
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.RESONATING_SPHERE_TALENT)
      );
    },
  },
  // link eb heal proc to fluttering heal
  {
    linkRelation: FIELD_OF_DREAMS_PROC,
    linkingEventId: SPELLS.EMERALD_BLOSSOM.id,
    linkingEventType: EventType.Heal,
    referencedEventId: SPELLS.FLUTTERING_SEEDLINGS_HEAL.id,
    referencedEventType: EventType.Heal,
    anyTarget: true,
    backwardBufferMs: EB_BUFFER_MS + 500,
    maximumLinks: 1,
    additionalCondition(linkingEvent, referencedEvent) {
      const diff = EB_BUFFER_MS - (linkingEvent.timestamp - referencedEvent.timestamp);
      return Math.abs(diff) < EB_VARIANCE_BUFFER;
    },
  },
  //link Call of Ysera Removal to the heals
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA_HOT,
    linkingEventId: [SPELLS.DREAM_BREATH.id, SPELLS.DREAM_BREATH_ECHO.id],
    linkingEventType: [EventType.ApplyBuff, EventType.Heal],
    referencedEventId: [SPELLS.DREAM_BREATH_CAST.id],
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Dream Breath cast that consumed it
  {
    linkRelation: DREAM_BREATH_CALL_OF_YSERA,
    linkingEventId: [SPELLS.CALL_OF_YSERA_BUFF.id],
    linkingEventType: [EventType.RemoveBuff],
    referencedEventId: [SPELLS.DREAM_BREATH_CAST.id],
    referencedEventType: [EventType.RemoveBuff],
    maximumLinks: 1,
    isActive(c) {
      return (
        c.hasTalent(TALENTS_EVOKER.DREAM_BREATH_TALENT) &&
        c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT)
      );
    },
  },
  //link Call of Ysera Removal to Living Flame heal that consumed it
  {
    linkRelation: LIVING_FLAME_CALL_OF_YSERA,
    linkingEventId: [SPELLS.LIVING_FLAME_HEAL.id],
    linkingEventType: [EventType.Heal],
    referencedEventId: [SPELLS.CALL_OF_YSERA_BUFF.id],
    referencedEventType: [EventType.RemoveBuff],
    backwardBufferMs: 1100,
    forwardBufferMs: CAST_BUFFER_MS,
    anyTarget: true,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT);
    },
  },
  // link essence burst remove to a cast to track expirations vs consumptions
  {
    linkRelation: ESSENCE_BURST_CONSUME,
    reverseLinkRelation: ESSENCE_BURST_CONSUME,
    linkingEventId: SPELLS.ESSENCE_BURST_BUFF.id,
    linkingEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    referencedEventId: [
      SPELLS.EMERALD_BLOSSOM_CAST.id,
      SPELLS.DISINTEGRATE.id,
      TALENTS_EVOKER.ECHO_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    anyTarget: true,
    forwardBufferMs: CAST_BUFFER_MS,
    backwardBufferMs: CAST_BUFFER_MS,
    isActive(c) {
      return c.hasTalent(TALENTS_EVOKER.ESSENCE_BURST_TALENT.id);
    },
  },
  // group TA shields and EB heals together for easy batch processing
  {
    linkRelation: HEAL_GROUPING,
    linkingEventId: [SPELLS.EMERALD_BLOSSOM.id, SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    linkingEventType: [EventType.Heal, EventType.ApplyBuff],
    referencedEventId: [SPELLS.EMERALD_BLOSSOM.id, SPELLS.TEMPORAL_ANOMALY_SHIELD.id],
    referencedEventType: EventType.Heal,
    anyTarget: true,
    additionalCondition(linkingEvent, referencedEvent) {
      if (
        (linkingEvent as AbilityEvent<any>).ability.guid !==
        (referencedEvent as AbilityEvent<any>).ability.guid
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.Heal &&
        (linkingEvent as HealEvent).targetID === (referencedEvent as HealEvent).targetID
      ) {
        return false;
      } else if (
        linkingEvent.type === EventType.ApplyBuff &&
        (linkingEvent as ApplyBuffEvent).targetID === (referencedEvent as ApplyBuffEvent).targetID
      ) {
        return false;
      }
      return (
        !HasRelatedEvent(linkingEvent, ECHO) &&
        !HasRelatedEvent(linkingEvent, ECHO_TEMPORAL_ANOMALY) &&
        !HasRelatedEvent(referencedEvent, ECHO) &&
        !HasRelatedEvent(referencedEvent, ECHO_TEMPORAL_ANOMALY)
      );
    },
  },
];

/**
 * When a spell is cast on a target, the ordering of the Cast and ApplyBuff/RefreshBuff/(direct)Heal
 * can be semi-arbitrary, making analysis difficult.
 *
 * This normalizer adds a _linkedEvent to the ApplyBuff/RefreshBuff/RemoveBuff linking back to the Cast event
 * that caused it (if one can be found).
 *
 * This normalizer adds links for Echo and Temporal Anomaly
 */
class CastLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

/** Returns true iff the given buff application or heal can be matched back to a hardcast */
export function isFromHardcastEcho(event: AbilityEvent<any>): boolean {
  return HasRelatedEvent(event, ECHO);
}

export function isFromTAEcho(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  return HasRelatedEvent(event, ECHO_TEMPORAL_ANOMALY);
}

export function isFromDreamBreathCallOfYsera(event: ApplyBuffEvent | RefreshBuffEvent | HealEvent) {
  if (HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA)) {
    return false;
  }
  return HasRelatedEvent(event, DREAM_BREATH_CALL_OF_YSERA_HOT);
}

export function isFromLivingFlameCallOfYsera(event: HealEvent) {
  return HasRelatedEvent(event, LIVING_FLAME_CALL_OF_YSERA);
}

export function isFromFieldOfDreams(event: HealEvent) {
  return HasRelatedEvent(event, FIELD_OF_DREAMS_PROC);
}

export function getEssenceBurstConsumeAbility(
  event: RemoveBuffEvent | RemoveBuffStackEvent,
): null | CastEvent {
  if (!HasRelatedEvent(event, ESSENCE_BURST_CONSUME)) {
    return null;
  }
  return GetRelatedEvents(event, ESSENCE_BURST_CONSUME)[0] as CastEvent;
}

export function getHealEvents(event: HealEvent) {
  return [event].concat(GetRelatedEvents(event, HEAL_GROUPING) as HealEvent[]);
}

export default CastLinkNormalizer;