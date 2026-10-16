/// Authentication repository interface and Supabase / Mock implementations.
library;

import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';

abstract interface class AuthRepository {
  Stream<AuthState> get authStateChanges;
  User? get currentUser;
  String? get currentUserId;
  bool get isAuthenticated;

  Future<AuthResponse> signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  Future<AuthResponse> signUpWithEmailAndPassword({
    required String email,
    required String password,
    String? fullName,
  });

  Future<void> signInWithOtp({required String email});

  Future<AuthResponse> verifyOtp({
    required String email,
    required String token,
  });

  Future<void> signOut();
}

/// Production implementation interacting directly with Supabase GoTrue Auth.
final class SupabaseAuthRepository implements AuthRepository {
  SupabaseAuthRepository(this._client);

  final SupabaseClient _client;

  @override
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  @override
  User? get currentUser => _client.auth.currentUser;

  @override
  String? get currentUserId => _client.auth.currentUser?.id;

  @override
  bool get isAuthenticated => _client.auth.currentUser != null;

  @override
  Future<AuthResponse> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    return await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  @override
  Future<AuthResponse> signUpWithEmailAndPassword({
    required String email,
    required String password,
    String? fullName,
  }) async {
    return await _client.auth.signUp(
      email: email.trim(),
      password: password,
      data: fullName != null ? {'full_name': fullName} : null,
    );
  }

  @override
  Future<void> signInWithOtp({required String email}) async {
    await _client.auth.signInWithOtp(email: email.trim());
  }

  @override
  Future<AuthResponse> verifyOtp({
    required String email,
    required String token,
  }) async {
    return await _client.auth.verifyOTP(
      email: email.trim(),
      token: token.trim(),
      type: OtpType.magiclink,
    );
  }

  @override
  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}

/// In-memory Mock Auth Repository for testing and offline scenarios.
final class MockAuthRepository implements AuthRepository {
  MockAuthRepository({User? initialUser}) : _currentUser = initialUser {
    _controller = StreamController<AuthState>.broadcast();
  }

  User? _currentUser;
  late final StreamController<AuthState> _controller;

  @override
  Stream<AuthState> get authStateChanges => _controller.stream;

  @override
  User? get currentUser => _currentUser;

  @override
  String? get currentUserId => _currentUser?.id;

  @override
  bool get isAuthenticated => _currentUser != null;

  void emitUser(User? user, AuthChangeEvent event) {
    _currentUser = user;
    _controller.add(AuthState(event, null));
  }

  @override
  Future<AuthResponse> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    return AuthResponse();
  }

  @override
  Future<AuthResponse> signUpWithEmailAndPassword({
    required String email,
    required String password,
    String? fullName,
  }) async {
    return AuthResponse();
  }

  @override
  Future<void> signInWithOtp({required String email}) async {}

  @override
  Future<AuthResponse> verifyOtp({
    required String email,
    required String token,
  }) async {
    return AuthResponse();
  }

  @override
  Future<void> signOut() async {
    _currentUser = null;
    _controller.add(const AuthState(AuthChangeEvent.signedOut, null));
  }

  void dispose() {
    _controller.close();
  }
}
