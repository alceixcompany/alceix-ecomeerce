'use client';
import {ReviewsScreen} from '@/modules/reviews';
import {useCreatorWorkspace} from '../components/workspace-provider';
import {brands} from '../mocks/workspace';
export function CreatorReviews(){const {workspace,creatorId}=useCreatorWorkspace();return <ReviewsScreen owner={{id:`creator:${creatorId}`,name:workspace.profile.creator.name,kind:'creator',city:workspace.profile.creator.location}} scope={`influencer:${creatorId}`} eligibleTargets={brands}/>;}
