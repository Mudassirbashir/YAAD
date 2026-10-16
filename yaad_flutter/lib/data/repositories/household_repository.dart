/// Household repository for managing households and memberships.
library;

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/household_model.dart';

abstract interface class HouseholdRepository {
  Future<List<HouseholdModel>> getHouseholdsForUser(String userId);
  Future<List<HouseholdMemberModel>> getMembers(String householdId);
  Future<void> createHousehold(HouseholdModel household);
  Future<void> addMember(HouseholdMemberModel member);
}

final class SupabaseHouseholdRepository implements HouseholdRepository {
  SupabaseHouseholdRepository(this._client);

  final SupabaseClient _client;

  @override
  Future<List<HouseholdModel>> getHouseholdsForUser(String userId) async {
    final response = await _client
        .from('households')
        .select('*')
        .order('created_at', ascending: false);

    return (response as List).map((row) {
      return HouseholdModel.fromJson(Map<String, dynamic>.from(row));
    }).toList();
  }

  @override
  Future<List<HouseholdMemberModel>> getMembers(String householdId) async {
    final response = await _client
        .from('household_members')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', ascending: true);

    return (response as List).map((row) {
      return HouseholdMemberModel.fromJson(Map<String, dynamic>.from(row));
    }).toList();
  }

  @override
  Future<void> createHousehold(HouseholdModel household) async {
    await _client.from('households').insert(household.toJson());
  }

  @override
  Future<void> addMember(HouseholdMemberModel member) async {
    await _client.from('household_members').insert(member.toJson());
  }
}

final class MockHouseholdRepository implements HouseholdRepository {
  final Map<String, HouseholdModel> _households = {};
  final List<HouseholdMemberModel> _members = [];

  @override
  Future<List<HouseholdModel>> getHouseholdsForUser(String userId) async {
    final userHouseholdIds = _members
        .where((m) => m.userId == userId && m.status == HouseholdMemberStatus.accepted)
        .map((m) => m.householdId)
        .toSet();

    return _households.values
        .where((h) => h.createdBy == userId || userHouseholdIds.contains(h.id))
        .toList();
  }

  @override
  Future<List<HouseholdMemberModel>> getMembers(String householdId) async {
    return _members.where((m) => m.householdId == householdId).toList();
  }

  @override
  Future<void> createHousehold(HouseholdModel household) async {
    _households[household.id] = household;
    // Auto-add creator as accepted owner
    _members.add(HouseholdMemberModel(
      id: 'member-${household.id}-${household.createdBy}',
      householdId: household.id,
      userId: household.createdBy,
      role: HouseholdRole.owner,
      status: HouseholdMemberStatus.accepted,
      createdAt: DateTime.now(),
    ));
  }

  @override
  Future<void> addMember(HouseholdMemberModel member) async {
    _members.add(member);
  }
}
