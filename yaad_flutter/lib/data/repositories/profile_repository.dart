/// Profile repository for managing user profile records in `public.profiles`.
library;

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile_model.dart';

abstract interface class ProfileRepository {
  Future<UserProfileModel?> getProfile(String userId);
  Future<void> upsertProfile(UserProfileModel profile);
}

final class SupabaseProfileRepository implements ProfileRepository {
  SupabaseProfileRepository(this._client);

  final SupabaseClient _client;

  @override
  Future<UserProfileModel?> getProfile(String userId) async {
    final response = await _client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (response == null) return null;
    return UserProfileModel.fromJson(Map<String, dynamic>.from(response));
  }

  @override
  Future<void> upsertProfile(UserProfileModel profile) async {
    await _client.from('profiles').upsert(profile.toJson());
  }
}

final class MockProfileRepository implements ProfileRepository {
  final Map<String, UserProfileModel> _profiles = {};

  @override
  Future<UserProfileModel?> getProfile(String userId) async {
    return _profiles[userId];
  }

  @override
  Future<void> upsertProfile(UserProfileModel profile) async {
    _profiles[profile.id] = profile;
  }
}
