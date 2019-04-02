import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesoOfflinePage } from './proceso-offline.page';

describe('ProcesoOfflinePage', () => {
  let component: ProcesoOfflinePage;
  let fixture: ComponentFixture<ProcesoOfflinePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcesoOfflinePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcesoOfflinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
